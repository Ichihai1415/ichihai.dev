export const onRequest = async (context) => {
    const url = new URL(context.request.url);
    const isDat = url.pathname.endsWith(".dat");
    const asset = await context.env.ASSETS.fetch(context.request);

    if (asset.status === 404 && isDat) {
        return asset;
    }

    return new Response(null, { status: 404 });
};
