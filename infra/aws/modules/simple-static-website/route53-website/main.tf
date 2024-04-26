data "aws_route53_zone" "website" {
  name         = var.name
  private_zone = false
}

resource "aws_route53_record" "website_a_apex" {
  zone_id = data.aws_route53_zone.website.zone_id

  name = data.aws_route53_zone.website.name
  type = "A"

  alias {
    name                   = var.cloudfront_website.domain_name
    zone_id                = var.cloudfront_website.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "website_aaaa_apex" {
  zone_id = data.aws_route53_zone.website.zone_id

  name = data.aws_route53_zone.website.name
  type = "AAAA"

  alias {
    name                   = var.cloudfront_website.domain_name
    zone_id                = var.cloudfront_website.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "website_a_www" {
  zone_id = data.aws_route53_zone.website.zone_id

  name = "www.${data.aws_route53_zone.website.name}"
  type = "A"

  alias {
    name                   = var.cloudfront_website.domain_name
    zone_id                = var.cloudfront_website.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "website_aaaa_www" {
  zone_id = data.aws_route53_zone.website.zone_id

  name = "www.${data.aws_route53_zone.website.name}"
  type = "AAAA"

  alias {
    name                   = var.cloudfront_website.domain_name
    zone_id                = var.cloudfront_website.hosted_zone_id
    evaluate_target_health = false
  }
}
