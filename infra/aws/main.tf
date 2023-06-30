# ########################################
# S3 - website
# ########################################

resource "aws_s3_bucket" "website" {
  bucket        = "brokenrobot.xyz-website"
  force_destroy = true

  tags = {
    Application = "brokenrobot.xyz"
    Environment = "production"
  }
}

resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id

  versioning_configuration {
    status = "Disabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  depends_on = [aws_s3_bucket_policy.website]
}

data "aws_iam_policy_document" "s3_cloudfront_access_policy" {
  statement {
    sid = "PolicyForCloudFrontPrivateContent"

    effect = "Allow"

    principals {
      type = "Service"
      identifiers = [
        "cloudfront.amazonaws.com"
      ]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "${aws_s3_bucket.website.arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values = [
        aws_cloudfront_distribution.website.arn
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id
  policy = data.aws_iam_policy_document.s3_cloudfront_access_policy.json
}

resource "aws_s3_bucket_ownership_controls" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# ########################################
# S3 - logs
# ########################################

resource "aws_s3_bucket" "logs" {
  bucket = "brokenrobot.xyz-logs"

  tags = {
    Application = "brokenrobot.xyz"
    Environment = "production"
  }
}

resource "aws_s3_bucket_ownership_controls" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "logs" {
  bucket = aws_s3_bucket.logs.id
  acl    = "private"

  depends_on = [aws_s3_bucket_ownership_controls.logs]
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    bucket_key_enabled = true
  }
}

# ########################################
# Certificate Manager - website
# ########################################

data "aws_acm_certificate" "website" {
  domain    = "brokenrobot.xyz"
  statuses  = ["ISSUED"]
  types     = ["AMAZON_ISSUED"]
  key_types = ["RSA_2048"]

  provider = aws.certificate_authority
}

# ########################################
# CloudFront - website
# ########################################

resource "aws_cloudfront_origin_access_control" "website" {
  name                              = aws_s3_bucket.website.bucket
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "url_rewrite" {
  name    = "url-rewrite"
  runtime = "cloudfront-js-1.0"
  publish = true
  code    = file("${path.module}/cloudfront-functions/url-rewrite/url-rewrite.js")
}

resource "aws_cloudfront_response_headers_policy" "security_headers_policy" {
  name = "security-headers-policy"

  security_headers_config {
    content_security_policy {
      content_security_policy = "default-src 'none'; connect-src 'self'; manifest-src 'self'; img-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'"

      override = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"

      override = true
    }

    referrer_policy {
      referrer_policy = "same-origin"

      override = true
    }

    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = true

      override = true
    }

    xss_protection {
      mode_block = true
      protection = true

      override = true
    }
  }

  custom_headers_config {
    items {
      header = "permissions-policy"
      value  = "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), display-capture=(), document-domain=(), encrypted-media=(), gamepad=(), geolocation=(), gyroscope=(), fullscreen=(self), magnetometer=(), microphone=(), midi=(), payment=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), speaker-selection=(), usb=(), web-share=(), xr-spatial-tracking=()"

      override = true
    }
  }
}

resource "aws_cloudfront_cache_policy" "caching_optimized" {
  name        = "caching-optimized"
  default_ttl = 86400
  max_ttl     = 31536000
  min_ttl     = 1

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  http_version        = "http2"

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = aws_s3_bucket.website.id
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id

    origin_shield {
      enabled              = false
      origin_shield_region = "eu-central-1"
    }
  }

  aliases = ["www.brokenrobot.xyz"]

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn            = data.aws_acm_certificate.website.arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  logging_config {
    bucket          = aws_s3_bucket.logs.bucket_domain_name
    include_cookies = false
    prefix          = ""
  }

  default_cache_behavior {
    target_origin_id           = aws_s3_bucket.website.id
    viewer_protocol_policy     = "redirect-to-https"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers_policy.id
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.caching_optimized.id

    allowed_methods = [
      "GET",
      "HEAD",
    ]

    cached_methods = [
      "GET",
      "HEAD",
    ]

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.url_rewrite.arn
    }
  }

  custom_error_response {
    error_code            = 403
    response_code         = 403
    response_page_path    = "/404.html"
    error_caching_min_ttl = 10
  }

  tags = {
    Application = "brokenrobot.xyz"
    Environment = "production"
  }
}

# ########################################
# Route 53 - website
# ########################################

data "aws_route53_zone" "website" {
  name         = "brokenrobot.xyz"
  private_zone = false
}

resource "aws_route53_record" "website" {
  zone_id = data.aws_route53_zone.website.zone_id

  name = "www.${data.aws_route53_zone.website.name}"
  type = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}
