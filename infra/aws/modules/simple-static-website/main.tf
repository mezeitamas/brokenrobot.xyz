# ########################################
# S3 - website
# ########################################

module "s3_bucket_website" {
  source = "./s3-bucket-website"

  name                        = var.s3_bucket_website.name
  s3_cloudfront_access_policy = data.aws_iam_policy_document.s3_cloudfront_access_policy.json

  tags = var.tags
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
      "${module.s3_bucket_website.arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values = [
        module.cloudfront_website.arn
      ]
    }
  }
}

# ########################################
# S3 - logs
# ########################################

module "s3_bucket_logs" {
  source = "./s3-bucket-logs"

  name = var.s3_bucket_logs.name

  tags = var.tags
}

# ########################################
# CloudFront - website
# ########################################

module "cloudfront_website" {
  source = "./cloudfront-website"

  s3_bucket_website = {
    id                   = module.s3_bucket_website.id
    bucket               = module.s3_bucket_website.bucket
    regional_domain_name = module.s3_bucket_website.bucket_regional_domain_name
  }

  s3_bucket_logs = {
    bucket_domain_name = module.s3_bucket_logs.bucket_domain_name
  }

  aws_acm_certificate_arn = var.cloudfront_website.acm_certificate_arn
  aws_cloudfront_function_viewer_request_arn = var.cloudfront_website.aws_cloudfront_function_viewer_request_arn
  content_security_policy = var.cloudfront_website.content_security_policy
  aliases = var.cloudfront_website.aliases

  tags = var.tags
}

# ########################################
# Route 53 - website
# ########################################

module "route53_website" {
  source = "./route53-website"

  name = var.route53_website.name

  cloudfront_website = {
    domain_name    = module.cloudfront_website.domain_name
    hosted_zone_id = module.cloudfront_website.hosted_zone_id
  }

  tags = var.tags
}
