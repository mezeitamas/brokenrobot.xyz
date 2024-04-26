variable "s3_bucket_website" {
  type        = object({
    name = string
  })
  nullable    = false
}

variable "s3_bucket_logs" {
  type        = object({
    name = string
  })
  nullable    = false
}

variable "cloudfront_website" {
  type        = object({
    acm_certificate_arn = string
    aliases = optional(list(string), [])
  })
  nullable    = false
}

variable "route53_website" {
  type        = object({
    name = string
  })
  nullable    = false
}

variable "tags" {
  type        = map(string)
  default     = {}
  nullable    = true
}
