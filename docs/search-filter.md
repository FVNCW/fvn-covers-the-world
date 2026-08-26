# 内容搜索 / 条件过滤系统

本文档总结 `FCTW.openapi.json` 中定义的内容搜索与条件过滤系统（`/api/search` 接口及其条件结构）。

## 1. 接口定义

### `POST /api/search`

根据内容类型与过滤条件，返回符合条件的内容列表。

#### 请求体

| 字段        | 类型           | 说明                               |
|-------------|----------------|------------------------------------|
| `type`      | `ContentType`  | 要搜索的内容类型，限定到某张内容表 |
| `condition` | `AnyCondition` | 过滤条件，可递归嵌套               |

**响应**：内容对象数组，元素类型与 `type` 对应（`Character` / `TextureObject` / `Illustration` / `Specy`）。

```json
{
  "type": "character",
  "condition": { ...AnyCondition... }
}
```

## 2. 内容类型 `ContentType`

```ts
type ContentType = "character" | "object" | "illustration" | "specy";
```

## 3. 条件结构总览

条件系统是一个**条件树**：

- **分支节点**：`ComposeCondition`（组合条件），用 `composeType` 指定子条件之间是 AND 还是 OR，可递归嵌套。
- **叶子节点**：`EqualCondition`（等值条件），真正描述「匹配哪个字段、怎么匹配」。

```plain
AnyCondition
├── EqualCondition   (叶子)  type: "equal"
│     ├── filter:     FieldFilter  具体字段匹配
│     └── fieldType:  FieldType[]  该 filter 作用的数据类型
└── ComposeCondition (分支) type: "compose"
      ├── composeType: "and" | "or"  子条件组合方式
      ├── filters:    AnyCondition[] 子条件（任意嵌套）
      └── fieldType:  FieldType[]
```

## 4. 条件节点

### 4.1 `EqualCondition`（== 条件）

```ts
interface EqualCondition {
  type: "equal";             // 固定值，用于区分 equal 与 compose
  filter: FieldFilter;       // 字段过滤器
  fieldType: FieldType[];    // 作用的字段类型
}
```

### 4.2 `ComposeCondition`（组合条件）

```ts
interface ComposeCondition {
  type: "compose";              // 固定值
  composeType: "and" | "or";    // 子条件组合方式
  filters: AnyCondition[];      // 子条件，可任意嵌套
  fieldType: FieldType[];
}
```

- `composeType: "and"` → 所有子条件同时满足
- `composeType: "or"` → 任一子条件满足即可

## 5. 字段过滤器 `FieldFilter`

`key` 为顶层必需字段，指明要匹配的对象字段（完全匹配键名）；随后按该字段的数据类型选用三种过滤方式之一。

```ts
interface FieldFilter {
  key: string;                       // 指定的键，必须完全匹配
  "string&array"?: StringArrayFilter; // 字段为字符串或数组时
  number?: NumberFilter;             // 字段为数字时
  color?: ColorFilter;               // 字段为 RGB 颜色时
}
```

### 5.1 字符串 / 数组字段 `string&array`

```ts
interface StringArrayFilter {
  mode: "equal" | "include";
  value: string;   // 关键词或全字匹配的值
}
```

| mode      | 语义                               |
|-----------|------------------------------------|
| `equal`   | 值全字相等（数组则为元素完全相等） |
| `include` | 值包含关键词（数组则为包含该元素） |

### 5.2 数字字段 `number`

```ts
interface NumberFilter {
  mode: "inRange" | "closet";
  pattern?: { a: number; b: number };
}
```

| mode      | pattern 语义                                            |
|-----------|---------------------------------------------------------|
| `inRange` | `a` = 闭区间左端，`b` = 闭区间右端，要求 `a <= 值 <= b` |
| `closet`  | `a` = 目标值，`b` = 最大偏移量，要求 `                  |

### 5.3 颜色字段 `color`

```ts
interface ColorFilter {
  target: string;      // 目标颜色
  allowOffset: string; // 允许的 deltaE 色差
}
```

按 `deltaE` 色差进行近似匹配，色差不超过 `allowOffset` 即命中。

## 6. 字段类型 `FieldType`

```ts
type FieldType = "string&array" | "number" | "color";
```

`FieldFilter` 中三种过滤方式与 `FieldType` 一一对应，用于声明条件作用的数据类型。

## 7. 使用示例

### 示例 1：按名字精确查找物种

```json
{
  "type": "specy",
  "condition": {
    "type": "equal",
    "fieldType": ["string&array"],
    "filter": {
      "key": "displayName",
      "string&array": { "mode": "equal", "value": "银龙" }
    }
  }
}
```

### 示例 2：身高范围 + 发色近似 的 AND 组合

```json
{
  "type": "character",
  "condition": {
    "type": "compose",
    "composeType": "and",
    "fieldType": ["number", "color"],
    "filters": [
      {
        "type": "equal",
        "fieldType": ["number"],
        "filter": {
          "key": "height",
          "number": { "mode": "inRange", "pattern": { "a": 150, "b": 180 } }
        }
      },
      {
        "type": "equal",
        "fieldType": ["color"],
        "filter": {
          "key": "color.fur",
          "color": { "target": "#C0C0C0", "allowOffset": "10" }
        }
      }
    ]
  }
}
```

### 示例 3：标签包含 OR 名字包含

```json
{
  "type": "illustration",
  "condition": {
    "type": "compose",
    "composeType": "or",
    "fieldType": ["string&array"],
    "filters": [
      {
        "type": "equal",
        "fieldType": ["string&array"],
        "filter": { "key": "tags", "string&array": { "mode": "include", "value": "庆祝" } }
      },
      {
        "type": "equal",
        "fieldType": ["string&array"],
        "filter": { "key": "displayName", "string&array": { "mode": "include", "value": "纪念" } }
      }
    ]
  }
}
```

## 8. 实现约定

- 后端：`POST /api/search` 由服务端实现，按 `type` 锁定内容表，递归求值 `condition` 条件树完成过滤。
- 前端：仅在 `frontend/src/engine/api/index.ts` 增加 `search(type, condition)` 封装与对应类型定义。
