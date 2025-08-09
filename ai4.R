set.seed(10)

library(jsonlite)
library(tidyverse)
library(logitnorm)
library(assertthat)

# Samples
corPrb <- 5 / 9
numSmp <- 10000

# Parameters for the logit-normal distribution
aiSd <- 1
aiMu0 <- -2
aiMu1 <- 2

aiCor <- runif(numSmp, 0, 1) < corPrb

corPrb <- rlogitnorm(numSmp, aiMu1, aiSd)
wrgPrb <- rlogitnorm(numSmp, aiMu0, aiSd)

# Generate the correct and wrong colors
numClr <- 4
corClr <- sample(numClr, numSmp, replace = TRUE)

# Randomly select a wrong color
getwrgClr <- function(corClrIdx) {
  clr <- 1:numClr
  clr <- clr[-corClrIdx]
  return(sample(clr, 1))
}

wrgClr <- map_int(corClr, getwrgClr)
assert_that(all(corClr != wrgClr))

# js 0-based index like Python
corClr <- corClr - 1
wrgClr <- wrgClr - 1

assert_that(all(corClr < numClr))
assert_that(all(wrgClr < numClr))

# Write the results to a tibble
aiRes <- tibble(
  idx = 1:numSmp - 1,
  maxClr = corClr,
  aiClr = ifelse(aiCor, corClr, wrgClr),
  aiCnf = round(ifelse(aiCor, corPrb, wrgPrb), 2)
)

# Convert the tibble to a JSON string (pretty formatting for readability)
json_string <- toJSON(aiRes, pretty = TRUE)
print(json_string)

# Alternatively, write the JSON directly to a file
write_json(aiRes, "data4.json", pretty = FALSE)

aiRes |> summarize(mean(aiCor), mean(aiCnf))
# # A tibble: 1 × 2
# `mean(aiCor)` `mean(aiCnf)`
# <dbl>         <dbl>
#   1         0.558         0.540

# https://onlinelibrary.wiley.com/doi/pdf/10.1002/9781118625392.wbecp048
d_to_auc <- function(d) {
  pnorm(d / sqrt(2))
}

d_to_auc((aiMu1 - aiMu0) / aiSd) # 0.99
