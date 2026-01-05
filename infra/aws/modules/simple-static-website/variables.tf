variable "apex_domain_name" {
  type     = string
  nullable = false
}

variable "cloudfront_website" {
  type = object({
    acm_certificate_arn                        = string
    aws_cloudfront_function_viewer_request_arn = string
    content_security_policy                    = optional(string)
  })
  nullable = false
}

variable "tags" {
  type     = map(string)
  default  = {}
  nullable = false
}
