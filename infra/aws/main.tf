locals {
  tags = {
    Application = "brokenrobot.xyz"
    Environment = "production"
  }
}

# ########################################
# Simple Static Website
# ########################################

module "simple_static_website" {
  source = "./modules/simple-static-website"

  s3_bucket_website = {
    name = "brokenrobot.xyz-website"
  }

  s3_bucket_logs = {
    name = "brokenrobot.xyz-logs"
  }

  cloudfront_website = {
    acm_certificate_arn                        = data.aws_acm_certificate.website.arn
    aws_cloudfront_function_viewer_request_arn = aws_cloudfront_function.viewer_request.arn
    content_security_policy                    = "default-src 'none'; child-src 'none'; connect-src 'self'; font-src 'self'; frame-src 'none'; img-src 'self' 'unsafe-inline'; manifest-src 'none'; media-src 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; script-src-attr 'self'; script-src-elem 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; style-src-attr 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline'; worker-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none';"

    aliases = [
      "brokenrobot.xyz",
      "www.brokenrobot.xyz"
    ]
  }

  route53_website = {
    name = "brokenrobot.xyz"
  }

  tags = local.tags
}

resource "aws_cloudfront_function" "viewer_request" {
  name    = "viewer-request"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = file("${path.module}/cloudfront-functions/viewer-request/viewer-request.js")
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
# SNS - alarms
# ########################################

resource "aws_sns_topic" "website_alarms_topic" {
  name         = "brokenrobot-xyz-alarms-topic"
  display_name = "Alarm Notifications for brokenrobot.xyz"

  tags = local.tags
}

resource "aws_sns_topic_subscription" "website_alarms_subscription" {
  for_each  = toset(var.website_alarms_endpoints)
  topic_arn = aws_sns_topic.website_alarms_topic.arn
  protocol  = "email"
  endpoint  = each.value
}

data "aws_iam_policy_document" "sns_topic_policy" {
  statement {
    actions = [
      "SNS:GetTopicAttributes",
      "SNS:SetTopicAttributes",
      "SNS:AddPermission",
      "SNS:RemovePermission",
      "SNS:DeleteTopic",
      "SNS:Subscribe",
      "SNS:ListSubscriptionsByTopic",
      "SNS:Publish"
    ]

    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    resources = [
      aws_sns_topic.website_alarms_topic.arn
    ]

    sid = "__default_statement_ID"
  }
}

# ########################################
# CloudWatch - metrics
# ########################################

resource "aws_cloudwatch_metric_alarm" "website_1k_requests_alarm" {
  alarm_name        = "brokenrobot.xyz - 1k request alarm"
  alarm_description = "Checks for if the number of requests to CloudFront crossed the 1k threshold"

  metric_name         = "Requests"
  comparison_operator = "GreaterThanThreshold"
  period              = "300"
  statistic           = "Average"
  threshold           = "1000"
  evaluation_periods  = "1"
  namespace           = "AWS/CloudFront"
  treat_missing_data  = "missing"

  actions_enabled = true
  alarm_actions = [
    aws_sns_topic.website_alarms_topic.arn
  ]

  dimensions = {
    DistributionId = module.simple_static_website.cloudfront_website.arn
    Region         = "Global"
  }

  tags = local.tags
}

resource "aws_cloudwatch_metric_alarm" "website_5k_requests_alarm" {
  alarm_name        = "brokenrobot.xyz - 5k request alarm"
  alarm_description = "Checks for if the number of requests to CloudFront crossed the 5k threshold"

  metric_name         = "Requests"
  comparison_operator = "GreaterThanThreshold"
  period              = "300"
  statistic           = "Average"
  threshold           = "5000"
  evaluation_periods  = "1"
  namespace           = "AWS/CloudFront"
  treat_missing_data  = "missing"

  actions_enabled = true
  alarm_actions = [
    aws_sns_topic.website_alarms_topic.arn
  ]

  dimensions = {
    DistributionId = module.simple_static_website.cloudfront_website.arn
    Region         = "Global"
  }

  tags = local.tags
}

resource "aws_cloudwatch_metric_alarm" "website_10k_requests_alarm" {
  alarm_name        = "brokenrobot.xyz - 10k request alarm"
  alarm_description = "Checks for if the number of requests to CloudFront crossed the 10k threshold"

  metric_name         = "Requests"
  comparison_operator = "GreaterThanThreshold"
  period              = "300"
  statistic           = "Average"
  threshold           = "10000"
  evaluation_periods  = "1"
  namespace           = "AWS/CloudFront"
  treat_missing_data  = "missing"

  actions_enabled = true
  alarm_actions = [
    aws_sns_topic.website_alarms_topic.arn
  ]

  dimensions = {
    DistributionId = module.simple_static_website.cloudfront_website.arn
    Region         = "Global"
  }

  tags = local.tags
}
