import { FileUpload } from '../interfaces/file-upload';
import path from 'path';
import fs from 'fs';
import uniqid from 'uniqid';

export default class FileSystem {

  constructor() {}

  storePostImage(fileImage: FileUpload, userId: string, postId: string, fileSystemName?: string) {
    try {
      return this.writeFile(fileImage, this.createFullDirectory(userId, postId), fileSystemName);
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private createFullDirectory(userId: string, postId: string): string {
    this.createDirectory(path.resolve(__dirname, `../uploads/`, `${userId}`));
    const storePostPath = path.resolve(__dirname, `../uploads/`, `${userId}/${postId}`);
    this.createDirectory(storePostPath);
    return storePostPath;
  }

  private createDirectory(filePath: string) {
    const pathExists = fs.existsSync(filePath);
    if (!pathExists) {
      fs.mkdirSync(filePath);
    }
  }

  private writeFile(fileImage: FileUpload, storePostPath: string, fileName?: string) {
    fileName = !!fileName ? fileName : this.getUniqueFileName(fileImage.name);
    if (!!fileName) {
      const fullStoragePath = `${storePostPath}/${fileName}`;
      fs.writeFileSync(fullStoragePath, fileImage.data);
      return {
        fileSystemName: fileName.split('.')[0],
        fileName: fileImage.name.split('.')[0],
        extension: fileName.split('.')[1]
      };
    }
    return null;
  }

  private getUniqueFileName(fileName: string): string {
    if (!!fileName && fileName.indexOf('.') !== -1) {
      const fileExtArr = fileName.split('.');
      return `${uniqid()}.${fileExtArr[fileExtArr.length - 1]}`;
    }
    return '';
  }

  resolveSystemImageURL(userId: string, postId: string, imageName: string): string {
    try {
      const imageUrl = path.resolve(__dirname, `../uploads/`, `${userId}/${postId}/${imageName}`);
      const urlExists = fs.existsSync(imageUrl);
      if (!urlExists) {
        return path.resolve(__dirname, `../assets/images/no-post-image.jpg`);
      }
      return imageUrl;
    } catch (err) {
      console.error('Error resolveSystemImageURL:', err);
      return '';
    }
  }
}
