export default function getCroppedImg(imageSrc, pixelCrop) {
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')
  
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = imageSrc
      img.onload = () => {
        ctx.drawImage(
          img,
          pixelCrop.x, pixelCrop.y,
          pixelCrop.width, pixelCrop.height,
          0, 0,
          pixelCrop.width, pixelCrop.height
        )
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob)
          resolve(url)
        }, 'image/jpeg')
      }
      img.onerror = error => reject(error)
    })
  }
  