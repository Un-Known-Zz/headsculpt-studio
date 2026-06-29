<?php
/**
 * 头雕定制工作室 - 表单提交处理 API
 * 
 * 功能：接收前端POST的JSON数据，保存为本地JSON文件
 * 部署：将此目录（data/inquiries/）设为 Web 服务器可写（chmod 755 或 777）
 * 
 * 安全建议：
 * 1. 生产环境请添加 CSRF token 验证
 * 2. 限制请求频率（Rate Limiting）
 * 3. 考虑添加 reCAPTCHA 人机验证
 */

// 仅允许 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 读取请求体
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !isset($data['name']) || !isset($data['phone'])) {
    http_response_code(400);
    echo json_encode(['error' => '缺少必填字段（姓名、电话）'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 构建完整记录
$record = [
    'id'        => uniqid('inq_', true),
    'timestamp' => date('Y-m-d H:i:s'),
    'ip'        => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'ua'        => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
    'name'      => trim($data['name']),
    'phone'     => trim($data['phone']),
    'demand'    => trim($data['demand'] ?? ''),
    'timeline'  => trim($data['timeline'] ?? ''),
    'budget'    => trim($data['budget'] ?? ''),
    'message'   => trim($data['message'] ?? ''),
];

// 按日期分文件存储（每天一个文件，便于管理）
$fileName = __DIR__ . '/' . date('Y-m-d') . '.json';
$existing = [];

if (file_exists($fileName)) {
    $content = file_get_contents($fileName);
    $existing = json_decode($content, true) ?: [];
}

$existing[] = $record;

// 写入文件（JSON_UNESCAPED_UNICODE 确保中文正常显示）
$written = file_put_contents(
    $fileName,
    json_encode($existing, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
);

if ($written === false) {
    http_response_code(500);
    echo json_encode(['error' => '文件写入失败，请检查目录权限'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 返回成功
http_response_code(200);
echo json_encode([
    'success' => true,
    'id'      => $record['id'],
    'message' => '提交成功！我们将在24小时内与您联系。'
], JSON_UNESCAPED_UNICODE);
