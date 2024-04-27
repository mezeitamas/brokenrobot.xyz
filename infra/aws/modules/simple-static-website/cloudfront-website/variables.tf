variable "s3_bucket_website" {
  type        = object({
    id                   = string
    bucket               = string
    regional_domain_name = string
  })
  nullable    = false
}

variable "s3_bucket_logs" {
  type        = object({
    bucket_domain_name = string
  })
  nullable    = false
}

variable "aws_acm_certificate_arn" {
  type        = string
  nullable    = false
}

variable "aws_cloudfront_function_viewer_request_arn" {
  type        = string
  nullable    = false
}

variable "content_security_policy" {
  type        = string
  default     = "default-src 'none'; child-src 'none'; connect-src 'self'; font-src 'self'; frame-src 'none'; img-src 'self' 'unsafe-inline'; manifest-src 'none'; media-src 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; script-src-attr 'self'; script-src-elem 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; style-src-attr 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline'; worker-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none';"
  nullable    = false
}

variable "aliases" {
  type        = list(string)
  default     = []
  nullable    = false
}

variable "tags" {
  type        = map(string)
  default     = {}
  nullable    = false
}
