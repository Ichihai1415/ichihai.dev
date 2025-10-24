#include <stdio.h>

int main()
{
    int priceA, priceB;

    printf("税率10％の商品の税抜価格を入力して下さい\n");
    scanf("%d", &priceA);
    printf("税率8％の商品の税抜価格を入力して下さい\n");
    scanf("%d", &priceB);

    printf("税込額は%.0f円です\n", (double)priceA * 1.1 + (double)priceB * 1.08);
    printf("税抜額は%d円です\n", priceA + priceB);
    printf("税額は%.0f円です\n", (double)priceA * 0.1 + (double)priceB * 0.08);
    return 0;
}