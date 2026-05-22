import { api } from "../api";
import { mediaApiEndPoints } from "./media.ApiEndPoints";
import { mediaResoponse } from "./media.interface";

export class MediaService{
    
 static async uploadImage(image: File): Promise<mediaResoponse>{
     try{
        const formData=new FormData();
        formData.append("file",image);
        const response=await api.post(mediaApiEndPoints.UPLOAD_IMAGE,formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
     }catch(e){
        throw e;
     }
 }

}