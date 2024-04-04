export class BaseXVIZLiveDataProvider{
    constructor(converter)
    {
        this.converter=converter;
        this.converter.initialize();
    }
    getXvizMessage(){
        let message= this.converter.convertMessage()
        return message;
    }
    xvizMetadata(){
        return this.converter.getMetadata();
    }
}