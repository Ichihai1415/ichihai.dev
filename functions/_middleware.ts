// functions/_middleware.ts
export const onRequest = async (context) => {
    const url = new URL(context.request.url);
    const isHtml = url.pathname.endsWith(".html");

    const asset = await context.env.ASSETS.fetch(context.request);

    if (asset.status === 404 && isHtml) {
        const notFoundPage = await context.env.ASSETS.fetch(
            "https://ichihai.dev/404.html"
        );
        console.log("404 page");
        return new Response(await notFoundPage.text(), { status: 404 });
    }
    console.log("404 response");
    return asset;
};
