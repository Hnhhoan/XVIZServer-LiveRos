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

import {XVIZUIBuilder} from '@xviz/builder';

export function getDeclarativeUI() {
  const builder = new XVIZUIBuilder({});
  
  builder.child(getVideoPanel(builder));
  return builder;
}
function getVideoPanel(builder) {
  const panel = builder.panel({
    name: 'Camera'
  });

  const video = builder.video({
    cameras: ['/infrastructure-side/camera','/vehicle-side/camera']
  });

  panel.child(video);
  return panel;
}
