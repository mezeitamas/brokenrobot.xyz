variable "name" {
  type        = string
  nullable    = false
}

variable "cloudfront_website" {
  type        = object({
    domain_name     = string
    hosted_zone_id = string
  })
  nullable    = false
}

variable "tags" {
  type        = map(string)
  default     = {}
  nullable    = false
}
