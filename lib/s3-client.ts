import { S3Client } from '@aws-sdk/client-s3';

function getS3Client() {
  return new S3Client({
    region: process.env.STORAGE_REGION || 'ams3',
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
}

let s3ClientInstance: S3Client | null = null;

export function getS3ClientInstance(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = getS3Client();
  }
  return s3ClientInstance;
}
