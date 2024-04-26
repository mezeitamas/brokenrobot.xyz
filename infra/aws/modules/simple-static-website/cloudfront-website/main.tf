resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  http_version        = "http2"

  origin {
    domain_name              = var.s3_bucket_website.regional_domain_name
    origin_id                = var.s3_bucket_website.id
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id

    origin_shield {
      enabled = false
    }
  }

  aliases = var.aliases

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn            = var.aws_acm_certificate_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  logging_config {
    bucket          = var.s3_bucket_logs.bucket_domain_name
    include_cookies = false
    prefix          = ""
  }

  default_cache_behavior {
    target_origin_id           = var.s3_bucket_website.id
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
      function_arn = aws_cloudfront_function.viewer_request.arn
    }
  }

  custom_error_response {
    error_code            = 403
    response_code         = 403
    response_page_path    = "/404.html"
    error_caching_min_ttl = 10
  }

  tags = var.tags
}

resource "aws_cloudfront_origin_access_control" "website" {
  name                              = var.s3_bucket_website.bucket
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "viewer_request" {
  name    = "viewer-request"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = file("${path.module}/cloudfront-functions/viewer-request/viewer-request.js")
}

resource "aws_cloudfront_response_headers_policy" "security_headers_policy" {
  name = "security-headers-policy"

  security_headers_config {
    content_security_policy {
      content_security_policy = "default-src 'none'; child-src 'none'; connect-src 'self'; font-src 'self'; frame-src 'none'; img-src 'self' 'unsafe-inline'; manifest-src 'none'; media-src 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; script-src-attr 'self'; script-src-elem 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; style-src-attr 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline'; worker-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none';"

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
  }

  custom_headers_config {
    items {
      header = "Cache-Control"
      value  = "public, max-age=0, must-revalidate"

      override = true
    }

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
