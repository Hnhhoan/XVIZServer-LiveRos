
export default class BoundingBoxConverter 
{
  constructor() {
    this.BOUNDING_BOX='/bounding_box';
  }
  async convertMessage(messageNumber,xvizBuilder) {
    xvizBuilder.variable(this.BOUNDING_BOX)
    .values({});
  }
  getMetadata(xvizMetaBuilder) {
   xvizMetaBuilder.stream(this.BOUNDING_BOX)
      .category('variables');
  }
  load(){}
}