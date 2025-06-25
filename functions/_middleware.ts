// functions/_middleware.ts
export const onRequest = async (context) => {
    const url = new URL(context.request.url);
    console.log(context.request.url);
    const isHtml = url.pathname.endsWith(".html");

    const asset = await context.env.ASSETS.fetch(context.request);

    if (asset.status === 404 && isHtml) {
        const notFoundPage = await context.env.ASSETS.fetch(
            "https://ichihai.dev/404.html"
        );
        return new Response(await notFoundPage.text(), { status: 404 });
    }
    return asset;
};
