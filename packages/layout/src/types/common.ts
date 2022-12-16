import { AssetPackage } from '@chameleon/render';

export type CAssetPackage = AssetPackage & {
  resourceType: 'Component' | 'Library';
};
