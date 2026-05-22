import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { uid } from './helpers';
import { getS3ClientInstance } from './s3-client';

function getConfig() {
  return {
    bucket: process.env.STORAGE_BUCKET || '',
    cdnUrl: process.env.STORAGE_CDN_URL?.replace(/\/$/, ''),
    endpoint: process.env.STORAGE_ENDPOINT?.replace(/\/$/, ''),
  };
}

function getFileUrl(key: string): string {
  const config = getConfig();
  if (config.cdnUrl) {
    return `${config.cdnUrl}/${key}`;
  }
  return `${config.endpoint}/${key}`;
}

export async function uploadToS3(
  file: File,
  directory: string,
): Promise<string> {
  const config = getConfig();

  if (!file) throw new Error('No file provided');
  if (!directory) throw new Error('No directory specified');

  const filename = `${uid()}_${file.name}`;
  const key = `${directory}/${filename}`;

  const s3Client = getS3ClientInstance();
  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000',
      ACL: 'public-read',
    }),
  );

  return getFileUrl(key);
}

export async function deleteFromS3(fileUrl: string): Promise<void> {
  const config = getConfig();
  if (!fileUrl) throw new Error('No file URL provided');

  let key = fileUrl;
  if (config.cdnUrl && fileUrl.startsWith(config.cdnUrl)) {
    key = fileUrl.replace(`${config.cdnUrl}/`, '');
  } else if (config.endpoint && fileUrl.startsWith(config.endpoint)) {
    key = fileUrl.replace(`${config.endpoint}/`, '');
  }

  const s3Client = getS3ClientInstance();
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}
