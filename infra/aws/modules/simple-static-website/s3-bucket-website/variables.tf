variable "name" {
  type        = string
  nullable    = false
}

variable "s3_cloudfront_access_policy" {
  type        = string
  nullable    = false
}

variable "tags" {
  type        = map(string)
  default     = {}
  nullable    = false
}
