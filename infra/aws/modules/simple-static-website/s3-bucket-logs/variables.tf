variable "name" {
  type     = string
  nullable = false
}

variable "tags" {
  type     = map(string)
  default  = {}
  nullable = false
}
