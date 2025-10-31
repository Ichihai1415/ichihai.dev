#include <stdio.h>

int main()
{
    int days = 1;
    int savings = 1;
    int total = 0;
    printf("日数    貯金額    貯金総額\n");
    while (1)
    {
        printf("%d    %d    %d\n", days, savings, total);
        if (total >= 1000000)
            break;
        days++;
        savings *= 2;
        total += savings;
    }
}