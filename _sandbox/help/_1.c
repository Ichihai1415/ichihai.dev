#include <stdio.h>

int main() {
    int year, month, day;
    double temperature;

    printf("現在の年月日をスペース区切りで入力して下さい. \n");
    scanf("%d %d %d", &year, &month, &day);
    printf("気温を入力して下さい. \n");
    scanf("%lf", &temperature);

    printf("今日は%d年", year);
    printf("%d月%d日です．\n", month, day);
    printf("気温は%5.1lf度です．\n", temperature);
    return 0;
}