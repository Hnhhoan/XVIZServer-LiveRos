// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global Buffer */
import fs from 'fs';
export function getDataInfo(dataInfoFilePath){
  //console.log(dataInfoFilePath);
  if (fs.existsSync(dataInfoFilePath)) {
    const content = fs.readFileSync(dataInfoFilePath, 'utf8');
    return JSON.parse(content);
  }
  return null;
}
export function validateTimestamp(timestamp) {
  // Read and parse the timestamps
  return timestamp/1000000;
}
export function multiply(a, b) {
  var aNumRows = a.length, aNumCols = a[0].length,
      bNumRows = b.length, bNumCols = b[0].length,
      m = new Array(aNumRows);  // initialize array of rows
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}
export function add(a,b){
  return a.map((r, i) => 
    r.map((v, j) => v + b[i][j]) 
); 
}
