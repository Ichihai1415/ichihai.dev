#include <stdio.h>

typedef struct
{
    int arr[2][3];
} Matrix;

Matrix change(Matrix m)
{
    m.arr[0][0] = 99;
    return m;
}

int main()
{
    Matrix mat = {{{1, 2, 3}, {4, 5, 6}}};
    mat = change(mat);             // 返り値を代入するのが重要
    printf("%d\n", mat.arr[0][0]); // → 99
}