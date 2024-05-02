# Nestjs repository

#algorithm #leetcode

**The problem**

```tsx
async update(@Body() body: UpdateUserDto, @Param('id') id: string) {
    const { password, ...rest } = body;
    const user = await this.userService.detail({ _id: id }, GET_USER_PROFILE_TYPE.full.name);
    if (isEmpty(user)) {
      throw new HttpException('Khách hàng không tồn tại', 200);
    }

    await this.userService.update({ _id: id }, rest);
    const resPartner = await this.postgresErpService.resPartner({ where: { id: user.odoo_customer_id }, include: [{ model: ResUsers }] });

    const userUpdated = await this.userService.detailAdminAggregate({ limit: 1, page: 1, _id: id });

    if (password) {
      const login = await this.loginService.detail({ users: id, type: LOGIN_TYPES['up'] });

      if (isEmpty(login)) {
        throw new HttpException('Tài khoản không có phương thức username/password', 200);
      }

      await this.passwordProcessService.setPassword({ login_id: login._id, password });
    }

    return {
      ...userUpdated,
      salesperson: resPartner?.salesperson || null,
    };
  }
```

Given two non-decreasing arrays `a` of length `m`, and `b` of length `n`. Merge the two arrays into array `a`. Since it’s an in-place merge, `a` has some extra spaces to fit the result.

**The solution**

Iterating from the end of both input arrays, at each iteration, pick the larger of the last two inputs and insert it into the end of the target array. Repeat this process until we reach the beginning of either input.

**For example:**

Given two arrays **a** and **b** of length **m** and **n** as follow:

```rust
pub fn readInputFile(allocator: std.mem.Allocator) ![]const u8 {
    const file = try std.fs.cwd().openFile("input.txt", .{});
    defer file.close();
    const stat = try file.stat();
    const fileSize = stat.size;
    return try file.reader().readAllAlloc(allocator, fileSize);
}
```
