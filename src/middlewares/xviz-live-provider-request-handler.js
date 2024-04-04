import {XVIZEnvelope} from '@xviz/io';
//import { getCurrentTimestamp } from '../helper/helper-functions';
const DEFAULT_OPTIONS = {
    delay: 0 // time in milliseconds
  };
export class XVIZLiveProviderRequestHandler{
    constructor(context, liveProvider, middleware, options = {}){
        this.context=context;
        this.liveProvider=liveProvider;
        this.middleware=middleware;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    }
    async onStart(msg) {
        this.ok=await this.liveProvider.isSubcribed();
        const loop=()=>{
            setTimeout(async() => {
                if(this.liveProvider.getStartTimestamp()==undefined){
                    loop();
                }else{
                    const metadata = this.liveProvider.xvizMetadata();
                    this.middleware.onMetadata(metadata);
                }
            }, 10);
          };
          loop();
    }
    async onTransformLog(msg){
        if(!this.ok)// fail to subscribe
        {
            const id=msg.message().data.id;
            this.middleware.onTransformLogDone(XVIZEnvelope.TransformLogDone({id}));
            //No Data to sent to client// so sent onTransformLogDone
            return;
        }
        var index=0;
        var currentTimestamp=this.liveProvider.getStartTimestamp();
        const loop=()=>{
            setTimeout(async() => {
              // Your logic here
              let data = await this.liveProvider.xvizMessage();
            if(data!=undefined)
            {
                this.middleware.onStateUpdate(data);// XVIZ Protocol
                currentTimestamp=parseFloat(data.updates[0].timestamp);
                //update currentTimestamp
            }
            if(currentTimestamp <=this.liveProvider.getEndTimestamp()){
                loop();
            }
            else {
                const id=msg.message().data.id;
                this.middleware.onTransformLogDone(XVIZEnvelope.TransformLogDone({id}));
                this.liveProvider.shutdown();//unsubscribe
            }
            }, 10);
          };
          loop();
    }
}


