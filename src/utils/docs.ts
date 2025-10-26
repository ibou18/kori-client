import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "ca-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadPdfToS3 = async (
  buffer: Buffer,
  fileName: string
): Promise<string> => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;
  const key = `quotes/${Date.now()}-${fileName}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: "application/pdf",
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

export const deleteFileFromS3 = async (fileKey: string): Promise<void> => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;

  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };

  const command = new DeleteObjectCommand(params);
  await s3.send(command);
};
