variable "s3_bucket_website" {
  type        = object({
    id     = string
    bucket = string
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

variable "aliases" {
  type        = list(string)
  default     = []
  nullable    = false
}

variable "tags" {
  type        = map(string)
  default     = {}
  nullable    = true
}
