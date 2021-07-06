﻿import * as ko from "knockout";
import * as mime from "mime";
import * as MediaUtils from "@paperbits/common/media/mediaUtils";
import { MediaContract, MediaVariantContract } from "@paperbits/common/media/mediaContract";
import { IWidgetOrder, IWidgetFactoryResult } from "@paperbits/common/editing";
import { HyperlinkModel } from "@paperbits/common/permalinks";

export const defaultFileName: string = "media.svg";
export const defaultURL: string = "https://cdn.paperbits.io/images/logo.svg";

export class MediaItem {
    public key: string;
    public blobKey: string;
    public widgetOrder: IWidgetOrder;
    public downloadUrl: ko.Observable<string>;
    public thumbnailUrl: ko.Observable<string>;
    public permalink: ko.Observable<string>;
    public fileName: ko.Observable<string>;
    public description: ko.Observable<string>;
    public keywords: ko.Observable<string>;
    public mimeType: ko.Observable<string>;
    public widgetFactoryResult: IWidgetFactoryResult<any, any>;
    public nonPreviewable: ko.Computed<boolean>;


    constructor(mediaContract: MediaContract) {
        this.key = mediaContract.key;
        this.blobKey = mediaContract.blobKey;
        this.fileName = ko.observable<string>(mediaContract.fileName);
        this.description = ko.observable<string>(mediaContract.description);
        this.keywords = ko.observable<string>(mediaContract.keywords);
        this.permalink = ko.observable<string>(mediaContract.permalink);
        this.mimeType = ko.observable<string>(mediaContract.mimeType);
        this.nonPreviewable = ko.computed(() => !mediaContract.mimeType?.startsWith("image/") && !mediaContract.mimeType?.startsWith("video/"));
        this.thumbnailUrl = ko.observable<string>();
        this.downloadUrl = ko.observable<string>(mediaContract.downloadUrl);
        this.setThumbnail(mediaContract);
    }

    private async setThumbnail(mediaContract: MediaContract): Promise<void> {
        if (mediaContract.mimeType?.startsWith("video")) {
            const dataUrl = await MediaUtils.getVideoThumbnailAsDataUrlFromUrl(mediaContract.downloadUrl);
            this.thumbnailUrl(dataUrl);
            return;
        }

        if (mediaContract.mimeType?.startsWith("image")) {
            if (mediaContract.variants) {
                const reducer = (smallest: MediaVariantContract, current: MediaVariantContract) => smallest.width <= current.width ? smallest : current;
                const smallestImageVariant = mediaContract.variants.reduce(reducer);
                this.thumbnailUrl(`${mediaContract.blobKey}${smallestImageVariant.width}x${smallestImageVariant.height}`);

                // const extension = mime.getExtension(smallestImageVariant.mimeType);
                // this.thumbnailUrl(`${mediaContract.blobKey}${smallestImageVariant.width}x${smallestImageVariant.height}.${extension}`);
            }
            else {
                this.thumbnailUrl(mediaContract.downloadUrl);
            }
            return;
        }

        this.thumbnailUrl(null); // TODO: Placeholder?
    }

    public isDefaultFileName(): boolean {
        return this.fileName() === defaultFileName;
    }

    public isDefaultUrl(): boolean {
        return this.downloadUrl() === defaultURL;
    }

    public updateDefault(newName: string): void {
        this.fileName(newName);
        this.permalink(this.permalink().replace(defaultFileName, newName));
        this.thumbnailUrl(this.downloadUrl());
    }

    public toMedia(): MediaContract {
        return {
            key: this.key,
            blobKey: this.blobKey,
            fileName: this.fileName(),
            description: this.description(),
            keywords: this.keywords(),
            mimeType: this.mimeType(),
            downloadUrl: this.downloadUrl(),
            permalink: this.permalink()
        };
    }

    public getHyperlink(): HyperlinkModel {
        const hyperlinkModel = new HyperlinkModel();
        hyperlinkModel.title = this.fileName();
        hyperlinkModel.target = "_download";
        hyperlinkModel.targetKey = this.key;
        hyperlinkModel.href = this.permalink();

        return hyperlinkModel;
    }
}