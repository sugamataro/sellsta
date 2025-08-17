// Cloudflare R2の設定
const R2_ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_R2_ACCOUNT_ID
const R2_BUCKET_NAME = import.meta.env.VITE_CLOUDFLARE_R2_BUCKET_NAME

// R2用のプリサインドURL生成（簡易版）
const generatePresignedUrl = async (fileName) => {
  // 実際の本番環境では、バックエンドサーバーでプリサインドURLを生成すべき
  // ここでは開発用の簡易実装

  // 簡略化されたプリサインドURL（実際にはAWS Signature V4が必要）
  const baseUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${fileName}`

  return {
    uploadUrl: baseUrl,
    publicUrl: `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.dev/${fileName}`,
    fileName: fileName,
  }
}

// 画像をR2にアップロード（圧縮してから）
export const uploadImageToR2 = async (file, userId) => {
  try {
    console.log('R2アップロード試行中...')

    // 現在はCORS問題があるため、一時的にBase64に直接フォールバック
    // R2の直接アップロードには認証署名が必要で、フロントエンドでは複雑すぎるため
    // 将来的にはバックエンドAPIを作成してプリサインドURLを生成する予定
    console.log('R2直接アップロードは認証が複雑なため、Base64形式を使用')
    return await uploadImageToFirestore(file)

    // 以下のコードは将来のバックエンドAPI実装時に使用
    /*
      const fileName = `posts/${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      console.log('画像圧縮開始:', file.name)
      const compressedBlob = await compressImage(file, 1200, 900, 0.85)
      console.log('圧縮完了:', (compressedBlob.size / 1024 / 1024).toFixed(2), 'MB')

      const { uploadUrl, publicUrl } = await generatePresignedUrl(fileName)

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': compressedBlob.type,
        },
        body: compressedBlob,
      })

      if (!response.ok) {
        throw new Error(`R2アップロード失敗: ${response.status}`)
      }

      console.log('R2アップロード成功:', publicUrl)

      return {
        type: 'r2',
        url: publicUrl,
        fileName: fileName,
        size: compressedBlob.size,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      }
      */
  } catch (error) {
    console.error('R2アップロードエラー:', error.message)
    console.log('Base64形式にフォールバック')
    return await uploadImageToFirestore(file)
  }
}

// 画像を圧縮する関数
const compressImage = async (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // アスペクト比を保持してリサイズ
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height

      // 画像を描画
      ctx.drawImage(img, 0, 0, width, height)

      // 圧縮された画像をBlobとして取得
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('画像の圧縮に失敗しました'))
          }
        },
        'image/jpeg', // JPEG形式で圧縮
        quality,
      )
    }

    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
    img.src = URL.createObjectURL(file)
  })
}

// Base64でFirestoreに保存（圧縮あり）
export const uploadImageToFirestore = async (file) => {
  try {
    console.log('元ファイルサイズ:', (file.size / 1024 / 1024).toFixed(2), 'MB')

    // 画像を圧縮
    const compressedBlob = await compressImage(file)
    console.log('圧縮後サイズ:', (compressedBlob.size / 1024 / 1024).toFixed(2), 'MB')

    // Base64に変換
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64Data = reader.result
        const sizeInMB = (base64Data.length * 0.75) / 1024 / 1024 // Base64のサイズ推定

        console.log('Base64サイズ推定:', sizeInMB.toFixed(2), 'MB')

        const resolveWithMetadata = (data) => {
          resolve({
            type: 'base64',
            url: data,
            size: data.length,
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
          })
        }

        if (sizeInMB > 0.9) {
          // 0.9MBを超える場合はさらに圧縮
          console.log('さらに圧縮が必要です')
          // より低い品質で再圧縮
          compressImage(file, 600, 450, 0.5)
            .then((smallerBlob) => {
              const smallerReader = new FileReader()
              smallerReader.onload = () => resolveWithMetadata(smallerReader.result)
              smallerReader.onerror = reject
              smallerReader.readAsDataURL(smallerBlob)
            })
            .catch(reject)
        } else {
          resolveWithMetadata(base64Data)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(compressedBlob)
    })
  } catch (error) {
    console.error('画像圧縮エラー:', error)
    throw new Error('画像の処理に失敗しました')
  }
}

export { R2_BUCKET_NAME }
