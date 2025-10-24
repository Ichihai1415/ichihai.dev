#include <stdio.h>
#include <stdbool.h>

int main()
{
    int days = 0;
    int savings = 1;
    int total = 0;
    printf("日数    貯金額    貯金総額\n");
    while (true)
    {
        days = days + 1;
        total = total + savings;
        printf("%d    %d    %d\n", days, savings, total);
        if (total > 1000000)
            break;
        savings = savings * 2;
    }
    printf("貯金総額が100万円を超えました:%d日目。\n", days);
}