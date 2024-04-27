output "arn" {
  value = aws_cloudfront_distribution.website.arn
}

output "domain_name" {
  value = aws_cloudfront_distribution.website.domain_name
}

output "hosted_zone_id" {
  value = aws_cloudfront_distribution.website.hosted_zone_id
}
