#!/bin/bash

# This script does a little cleanup on the .svg that omnigraffle generates. 
# Omnigraffle exports embedded images as pdfs that don't work in the browser).

find ./svg -name '*.svg' -exec sed -i -- 's/image1\.tiff/sierra.png/g' {} \;
find ./svg -name '*.svg' -exec sed -i -- 's/image2\.pdf/ec2.png/g' {} \;
find ./svg -name '*.svg' -exec sed -i -- 's/image3\.pdf/stream.png/g' {} \;
find ./svg -name '*.svg' -exec sed -i -- 's/image4\.pdf/lambda.png/g' {} \;
