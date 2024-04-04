export default class TopicBuffer{
	constructor(t){
	this.topic=t;
	this.buffer=[];
	this.bufferSize=t.size?t.size:10;
	this.drop=0;
	}
	push(msg){
	this.buffer.push(msg);
		if(this.buffer.length>this.bufferSize)
		{
			this.buffer.shift();
			this.drop=this.drop+1;
		}
	}
	read(){
		return this.buffer.shift();
	}
}
