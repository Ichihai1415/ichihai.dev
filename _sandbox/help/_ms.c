#include <stdio.h>
#include <stdlib.h>

// 課題1
struct ms
{
    int mine;
    int mineMap[8][8];
    int gameBoard[8][8];
    int remain;
};

typedef struct ms ms_t;

// 課題4
ms_t setMines(ms_t ms)
{
    int c; // 配置数
    for (c = 0; c < ms.mine;)
    {
        int cell = rand() % 64;
        if (ms.mineMap[cell / 8][cell % 8] != -1)
        {
            ms.mineMap[cell / 8][cell % 8] = -1;
            c = c + 1;
        }
    }

    int i, j;
    for (i = 0; i < 8; i = i + 1)
    {
        for (j = 0; j < 8; j = j + 1)
        {
            if (ms.mineMap[i][j] != -1)
            {
                int k, l;
                int cn = 0; // 周囲の地雷の数
                for (k = i - 1; k <= i + 1; k = k + 1)
                {
                    for (l = j - 1; l <= j + 1; l = l + 1)
                    {
                        if ((k == i && l == j) || k == -1 || l == -1 || k == 8 || l == 8)
                        {
                            continue;
                        }
                        if (ms.mineMap[k][l] == -1)
                        {
                            cn = cn + 1;
                        }
                    }
                }
                ms.mineMap[i][j] = cn;
            }
        }
    }
    ms.remain = 64 - ms.mine;
    return ms;
}

// 課題5
void showGameBoard(ms_t ms)
{
    printf("\n[i]\n");
    int i, j;
    for (i = 0; i < 8; i = i + 1)
    {
        printf(" %d |", i);
        for (j = 0; j < 8; j = j + 1)
        {
            if (ms.gameBoard[i][j] == 0)
                printf(" x ");
            else if (ms.mineMap[i][j] == -1) // 適当なゲームオーバー
                printf("OUT");
            else
                printf(" %d ", ms.mineMap[i][j]);
        }
        printf("\n");
    }
    printf("   -------------------------\n     0  1  2  3  4  5  6  7 [j]\n");
}

// 課題6
ms_t minesweeper(ms_t ms)
{
    printf("開けるセルを入力してください（i j）\n");
    int i, j;
    scanf("%d %d",
          &i, &j);

    if (ms.mineMap[i][j] == -1) // 勝手な改造（OUT指定したら終了）
    {
        ms.gameBoard[i][j] = 1;
        ms.remain = -1;
        return ms;
    }
    int k, l;
    for (k = i - 1; k <= i + 1; k = k + 1)
    {
        for (l = j - 1; l <= j + 1; l = l + 1)
        {
            if (k == -1 || l == -1 || k == 8 || l == 8 || ms.mineMap[k][l] == -1 || ms.gameBoard[k][l] == 1)
            {
                continue;
            }
            ms.gameBoard[k][l] = 1;
            ms.remain = ms.remain - 1;
        }
    }
    return ms;
}

int main()
{
    // 課題2
    ms_t ms;
    printf("地雷の数を入力してください\n");
    int _mine;
    scanf("%d", &_mine);
    ms.mine = _mine;
    printf("%d個の地雷を設置します\n", ms.mine);

    // 課題3
    int i, j;
    for (i = 0; i < 8; i = i + 1)
    {
        for (j = 0; j < 8; j = j + 1)
        {
            ms.mineMap[i][j] = 0;
            ms.gameBoard[i][j] = 0;
        }
    }
    ms = setMines(ms);
    showGameBoard(ms);

    while (ms.remain > 0)
    {
        ms = minesweeper(ms);
        showGameBoard(ms);
    }

    if (ms.remain == 0) // 勝手な改造
    {
        printf("\nCLEAR!\n");
    }
    else //-1
    {
        printf("\nGAME OVER...\n");
    }

    while (1) // 勝手な改造（enterで終了）
    {
        scanf("%d");
    }

    return 0;
}