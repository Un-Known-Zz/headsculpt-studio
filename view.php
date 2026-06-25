<?php
/**
 * 头雕定制工作室 - 意向咨询数据查看页面
 * 
 * 访问方式：data/inquiries/view.php
 * 生产环境请添加密码保护！
 */

// 简单密码保护（部署后请修改此密码）
$PASSWORD = 'headsculpt2026';
$isAuth = false;

// 检查密码
if (isset($_POST['pwd']) && $_POST['pwd'] === $PASSWORD) {
    setcookie('inq_auth', md5($PASSWORD . 'salt'), time() + 86400);
    $isAuth = true;
} elseif (isset($_COOKIE['inq_auth']) && $_COOKIE['inq_auth'] === md5($PASSWORD . 'salt')) {
    $isAuth = true;
}

// 未认证则显示登录页
if (!$isAuth) {
    ?>
<!DOCTYPE html>
<html lang="zh">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>数据查看 - 登录</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0A0A0C;color:#EAEAEE;font-family:"Microsoft YaHei",sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
.box{background:#18181E;padding:40px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);width:360px}
.box h2{text-align:center;margin-bottom:24px;color:#D4A843}
.box input{width:100%;height:44px;background:#1E1E26;border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#EAEAEE;padding:0 16px;font-size:15px;margin-bottom:16px}
.box input:focus{outline:none;border-color:#D4A843}
.box button{width:100%;height:44px;background:linear-gradient(135deg,#D4A843,#B8912E);color:#0A0A0C;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer}
</style></head>
<body><div class="box">
<h2>🔒 数据查看</h2>
<form method="post">
<input type="password" name="pwd" placeholder="请输入访问密码" autofocus>
<button type="submit">进入</button>
</form>
</div></body></html>
    <?php
    exit;
}

// 加载所有数据
$files = glob(__DIR__ . '/*.json');
$allRecords = [];

foreach ($files as $file) {
    $records = json_decode(file_get_contents($file), true) ?: [];
    $allRecords = array_merge($allRecords, $records);
}

// 按时间倒序
usort($allRecords, function($a, $b) {
    return strcmp($b['timestamp'] ?? '', $a['timestamp'] ?? '');
});

$total = count($allRecords);
?>
<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>意向咨询数据 - 老李头头雕工作室</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0A0A0C;color:#EAEAEE;font-family:"Microsoft YaHei",sans-serif;padding:20px}
.header{max-width:1200px;margin:0 auto 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
.header h1{font-size:24px;color:#D4A843}
.header .count{color:#9A9BA6;font-size:14px}
.header a{color:#E74C3C;font-size:14px;text-decoration:none}
.container{max-width:1200px;margin:0 auto}
table{width:100%;border-collapse:collapse;font-size:14px}
th{background:#18181E;color:#9A9BA6;font-weight:500;text-align:left;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08)}
td{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);vertical-align:top}
tr:hover td{background:rgba(255,255,255,0.03)}
.tag{padding:2px 8px;border-radius:20px;font-size:11px;border:1px solid rgba(255,255,255,0.12)}
.tag-new{background:rgba(46,204,113,0.1);color:#2ECC71;border-color:rgba(46,204,113,0.3)}
.empty{text-align:center;padding:80px 20px;color:#5C5D6B}
@media(max-width:768px){table{font-size:12px}th,td{padding:8px 10px}}
</style>
</head>
<body>
<div class="header">
    <h1>📋 意向咨询数据</h1>
    <span class="count">共 <?= $total ?> 条记录</span>
    <a href="?logout=1">退出</a>
</div>
<div class="container">
<?php if ($total === 0): ?>
    <div class="empty">暂无咨询记录</div>
<?php else: ?>
    <table>
    <thead><tr>
        <th>时间</th><th>姓名</th><th>电话</th><th>定制需求</th><th>工期</th><th>预算</th><th>留言</th>
    </tr></thead>
    <tbody>
    <?php foreach ($allRecords as $r): ?>
    <tr>
        <td style="white-space:nowrap"><?= htmlspecialchars(substr($r['timestamp'] ?? '', 0, 16)) ?></td>
        <td><?= htmlspecialchars($r['name'] ?? '') ?></td>
        <td><?= htmlspecialchars($r['phone'] ?? '') ?></td>
        <td><?= htmlspecialchars(mb_substr($r['demand'] ?? '', 0, 30)) ?><?= mb_strlen($r['demand'] ?? '') > 30 ? '…' : '' ?></td>
        <td><?= htmlspecialchars($r['timeline'] ?? '') ?></td>
        <td><?= htmlspecialchars($r['budget'] ?? '') ?></td>
        <td><?= htmlspecialchars(mb_substr($r['message'] ?? '', 0, 30)) ?><?= mb_strlen($r['message'] ?? '') > 30 ? '…' : '' ?></td>
    </tr>
    <?php endforeach; ?>
    </tbody></table>
<?php endif; ?>
</div>
</body>
</html>
