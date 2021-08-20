import { v2 } from 'cloudinary';
import { CLOUDINARY } from '../constants/constants';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    return v2.config({
      cloud_name: 'hd4m2sihx',
      api_key: '973577463187146',
      api_secret: '8qIVn9ufiL8W9R-zXyW6uaJN7v8',
    });
  },
};