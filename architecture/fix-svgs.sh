#!/bin/bash

find ./svg -name '*.svg' -exec sed -i -- 's/image1\.tiff/sierra.png/g' {} \;
find ./svg -name '*.svg' -exec sed -i -- 's/image2\.pdf/ec2.png/g' {} \;
find ./svg -name '*.svg' -exec sed -i -- 's/image3\.pdf/stream.png/g' {} \;
find ./svg -name '*.svg' -exec sed -i -- 's/image4\.pdf/lambda.png/g' {} \;
