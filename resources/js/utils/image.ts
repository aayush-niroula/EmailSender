export async function compressImage(
    file: File,
): Promise<File> {
    if (
        !file.type.startsWith("image/") ||
        file.size <= 1024 * 1024
    ) {
        return file;
    }

    try {
        const image = await decodeImage(file);

        const scale = Math.min(
            1,
            2000 / Math.max(
                image.width,
                image.height,
            ),
        );

        const canvas =
            document.createElement("canvas");

        canvas.width = Math.max(
            1,
            Math.round(image.width * scale),
        );

        canvas.height = Math.max(
            1,
            Math.round(image.height * scale),
        );

        canvas
            .getContext("2d")
            ?.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height,
            );

        const blob = await canvasToBlob(
            canvas,
            0.75,
        );

        const compressedBlob =
            blob && blob.size < file.size
                ? blob
                : await canvasToBlob(
                      canvas,
                      0.55,
                  );

        if (
            !compressedBlob ||
            compressedBlob.size >= file.size
        ) {
            return file;
        }

        return new File(
            [compressedBlob],
            file.name.replace(
                /\.[^.]+$/,
                ".jpg",
            ),
            {
                type: "image/jpeg",
                lastModified: file.lastModified,
            },
        );
    } catch {
        return file;
    }
}

export async function decodeImage(
    file: File,
): Promise<ImageBitmap | HTMLImageElement> {
    if (
        typeof createImageBitmap ===
        "function"
    ) {
        return createImageBitmap(file);
    }

    return new Promise(
        (resolve, reject) => {
            const image = new Image();

            const url =
                URL.createObjectURL(file);

            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve(image);
            };

            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(
                    new Error(
                        "Unable to decode image",
                    ),
                );
            };

            image.src = url;
        },
    );
}

export function canvasToBlob(
    canvas: HTMLCanvasElement,
    quality: number,
): Promise<Blob | null> {
    return new Promise((resolve) =>
        canvas.toBlob(
            resolve,
            "image/jpeg",
            quality,
        ),
    );
}