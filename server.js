const express = require('express');
const cors = require('cors');
const axios = require('axios');
const qs = require('qs');

const app = express();
const port = 3000;

// 配置跨域和JSON解析
app.use(cors());
app.use(express.json());

// -------------------------- 替换成你自己的信息 --------------------------
const APP_ID = 'cli_aa81770143f9dbcb'; // 你的飞书App ID
const APP_SECRET = 'XNpOuzUKh1niPh2SWaefndW7icd7mtpb';    // 替换成你的飞书App Secret
const FEISHU_APP_TOKEN = 'OhgXbTwWJaXHujsTL34cMVdgnS9'; // 表格URL里的app_token
const FEISHU_TABLE_ID = 'tblMtMMP1lnBgZXA';   // 表格URL里的table_id
// ---------------------------------------------------------------------

// 1. 获取飞书的tenant_access_token（凭证）
async function getTenantToken() {
  try {
    const res = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      qs.stringify({ app_id: APP_ID, app_secret: APP_SECRET }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    if (res.data.code === 0) {
      return res.data.tenant_access_token;
    }
    console.error('获取Token失败:', res.data);
    return null;
  } catch (err) {
    console.error('请求Token接口出错:', err);
    return null;
  }
}

// 2. 核心接口：读取多维表格里的客户数据
app.get('/api/feishu/customers', async (req, res) => {
  const token = await getTenantToken();
  if (!token) {
    return res.status(500).json({ success: false, msg: '获取飞书凭证失败' });
  }

  try {
    // 调用飞书多维表格API
    const apiUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records`;
    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.code === 0) {
      // 把飞书返回的数据，整理成前端好读的格式
      const customers = response.data.data.items.map(item => ({
        recordId: item.record_id,
        name: item.fields['客户姓名'] || '',
        phone: item.fields['联系电话'] || '',
        address: item.fields['客户地址'] || '',
        product: item.fields['意向产品'] || '',
        amount: item.fields['意向金额'] || 0,
        status: item.fields['跟进状态'] || '',
        nextFollowUp: item.fields['下次跟进时间'] || '',
        remark: item.fields['备注'] || ''
      }));
      // 返回给前端
      res.json({ success: true, data: customers });
    } else {
      res.status(400).json({ success: false, msg: response.data.msg });
    }
  } catch (err) {
    console.error('调用飞书API出错:', err);
    res.status(500).json({ success: false, msg: '接口调用出错' });
  }
});

// 启动服务
app.listen(port, () => {
  console.log(`✅ 后端服务已启动！`);
  console.log(`👉 访问地址：http://localhost:${port}/api/feishu/customers`);
});