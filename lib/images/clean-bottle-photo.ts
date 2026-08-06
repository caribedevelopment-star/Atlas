export async function cleanBottlePhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file); const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height)); const width = Math.round(bitmap.width * scale), height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas'); canvas.width=width; canvas.height=height; const context=canvas.getContext('2d',{willReadFrequently:true}); if(!context)throw new Error('No se pudo procesar la fotografía.'); context.drawImage(bitmap,0,0,width,height); bitmap.close();
  const image=context.getImageData(0,0,width,height),data=image.data,corners=[[0,0],[width-1,0],[0,height-1],[width-1,height-1]],background=corners.reduce((value,[x,y])=>{const index=(y*width+x)*4;return[value[0]+data[index]/4,value[1]+data[index+1]/4,value[2]+data[index+2]/4]},[0,0,0]);
  for(let index=0;index<data.length;index+=4){const distance=Math.hypot(data[index]-background[0],data[index+1]-background[1],data[index+2]-background[2]);if(distance<34)data[index+3]=0;else if(distance<72)data[index+3]=Math.round(255*(distance-34)/38)}
  context.putImageData(image,0,0); const blob=await new Promise<Blob|null>((resolve)=>canvas.toBlob(resolve,'image/webp',.9)); if(!blob)throw new Error('No se pudo preparar la fotografía.'); return new File([blob],`${file.name.replace(/\.[^.]+$/,'')}-botella.webp`,{type:'image/webp'});
}
