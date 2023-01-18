---
title: Queue 與 Dispatcher
keywords:
  - Router
  - 分配器
categories:
  - 軟體開發
draft: true
slug: queue-與-dispatcher
date: 2023-01-18T08:19:55.044Z
---

> [第 11 屆(2020) iThome 鐵人賽](https://ithelp.ithome.com.tw/users/20107551/ironman/2172)文章補完計劃，[從零開始土炮 MQ]({{< ref "../foreword/index.md#基礎篇">}}) 基礎篇

<!--more-->

## 五、分配機制(調度)

有一天，由於 queue 內的資料量過大，而 worker 來不及消化。我們需要增加 worker 的個數，來加速 queue 的內容。

這時，需要有一個機制，讓 worker 順利取得**正確**而**不重複**的資料內容，讓它可以進行資料處理。

![dispatch](/dispatch.png)

### 5.1 Dispatch 的註冊

不管是 pull 或是 subscript 那一種方式，當多個 consumer 來請求資料時，都必須先註冊，這樣配置器(Dispatch) 才知道有那些資源可以使用。

舉例來說，今天你要發糖果給小朋友，如果小朋友沒有到你面前跟你要糖果，你一定不知道要發給誰。

所以，我們可以得到 dispatch 的特性一，所有相關的 consumer 都必須要進行註冊動作。

```c#
public interface IConsumer
{
    
}
```

```c#
public interface Dispatch<T>
{
     void Binding(ConcurrentQueue<T> queue);
     void Register(IConsumer consumer);
}
```

> 補充訂閱者模式

在分派資源的處理原則，還是保持 FIFO 。

在下面實例，會實作三種分派的情境，與一種筆者實作的過的情況。

### 5.2 同質性分派

```
情境一：當 Queue 中存在多筆相同類型的資料，禁止 Consumer 直接取得資料，中間需經由 Dispatch 去分配資料。
```

這個是與生產者消費者模式的應用情境相似，只是 consumer 無法直接跟 Queue 取得資源，必須依賴 Dispatch 的分派。也因為如此，主動權由 Consumer 移致 Dispatch。

當有多個 conumer 同時跟 queue 請求資料時，Dispatch 會依據 consumer 請求的順序，依先進先出的原則，逐一將資料回傳給 consumer。

![](dispatch_1.png)

將前面提到的 `IDispatch<T>` 與 `IConsumer<T>` 進行迭代。

```C#
public interface IDispatch<T>
{
    void Binding(ConcurrentQueue<T> queue);

    void Register(IConsumer<T> consumer);

    T Push();
}

public interface IConsumer<T>
{
    void Binding(IDispatch<T> dispatch);
}
```

接下來，進行實作的程式。

同時，因為實作內容的 `int` 同質性的處理，`Consumber` 的部份，就偷懶直接指定為 `int` 的類別。

```C#
public class HomogeneityDispatch<T> : IDispatch<T>
{
    private ConcurrentQueue<T> _bindingQueue;
    private List<IConsumer<T>> _consumers;

    public void Binding(ConcurrentQueue<T> queue)
    {
        _bindingQueue = queue;
    }

    public void Register(IConsumer<T> consumer)
    {
        consumer.Binding(this);
        _consumers.Add(consumer);
    }

    public T Push()
    {
        if (_bindingQueue.IsEmpty)
            return default(T);

        _bindingQueue.TryDequeue(out T result);

        return result;
    }
}

public class Consumer : IConsumer<int>
{
    protected IDispatch<int> _dispatch;

    public void Binding(IDispatch<int> dispatch)
    {
        _dispatch = dispatch;
    }

    public virtual void DoWork()
    {
    }
}
```

接著，簡單測試兩種情境。

```c#
// 測試案例
private class ConsumerTest : Consumer
{
    public List<int> Queue { get; } = new List<int>();

    public override void DoWork()
    {
        Queue.Add(_dispatch.Push());
    }
}

[TestMethod]
public void ConsumerTest_單consumer取值_資料順序相同()
{
    var expect = new int[] { 24, 12, 16, 22 };
    ConcurrentQueue<int> queue = new ConcurrentQueue<int>(expect);

    var dispatch = new HomogeneityDispatch<int>();
    dispatch.Binding(queue);

    var consumer1 = new ConsumerTest();
    dispatch.Register(consumer1);

    consumer1.DoWork();
    consumer1.DoWork();
    consumer1.DoWork();
    consumer1.DoWork();

    var actual = consumer1.Queue.ToArray();

    expect.ToExpectedObject().ShouldEqual(actual);
}

[TestMethod]
public void ConsumerTest_當2個consumer輸流取值時_取回資料與順序相符()
{
    ConcurrentQueue<int> queue = new ConcurrentQueue<int>(new[] { 1, 2, 3, 4 });

    var dispatch = new HomogeneityDispatch<int>();
    dispatch.Binding(queue);

    var consumer1 = new ConsumerTest();
    var consumer2 = new ConsumerTest();

    dispatch.Register(consumer1);
    dispatch.Register(consumer2);

    consumer1.DoWork();
    consumer2.DoWork();
    consumer1.DoWork();

    var actual = consumer1.Queue.ToArray();

    (new[] { 1, 3 }).ToExpectedObject().ShouldEqual(actual);

    actual = consumer2.Queue.ToArray();
    (new[] { 2 }).ToExpectedObject().ShouldEqual(actual);
}
```

### 5.3 異質性分派

```
情境二：當 Queue 中存在不同類型的資料，要如何將其分派到對應的 Consumer。
```

關於這個情境，可以分為兩個的處理：

* 同一個 Queue 要如何儲存異質性的資料。
* `Dispatch` 如何識別異質性資料，並正確分派到對應的 Consumer。

![diff_queue_dispatch](/dispatch_2.png)

首先，異質性資料如何儲存在一個 Queue 之中，己經在前一章的`通用型的 Router` 提到相關的概念。

來回憶一下前面在實作 `Router` 時，針對 C# 的 Value Type 資料的迭代過程嗎？

* 最初利用 `Type` 來辨識不同類型的資料，分別放到專屬的 Queue；
* 接著運用 `object` 的 Boxing/Unboxing 的機制，建立通用的 Queue。
* 最後是運用 `Label`來進行資料類型的分類，以 `byte[]` 來紀錄資料本身的內容。

所以，將 Queue 的資料類型，由 `byte[]` 變更為 `QueueItem` ，就直接運用 `QueueItem` ，達到同一個 Queue 儲存不同 `value Type` 或不同 `Reference Type` 的資料。

但筆者覺得可以額外提一下，對於有繼承關係的 `Reference Type` ，可以利用 `里氐替換原則` 將其儲存在同一個 Queue 之中。

而 `Reference type` 的資料的識別方式，可分兩種；**本身存在識別碼** 或 **Reference Type 可被識別**。

```C#
internal class CircleShape : ShapeBase
{
    public override string Type => "circle";
}

internal class RectShape : ShapeBase
{
    public override string Type => "Rect";
}

internal abstract class ShapeBase
{
    //  識別碼
    public abstract string Type { get; }
}
```

```C#
static void Main(string[] args)
{
    var queue = new ConcurrentQueue<ShapeBase>();

    queue.Enqueue(new RectShape());
    queue.Enqueue(new CircleShape());

    while (!queue.IsEmpty)
    {
        queue.TryDequeue(out var shape);

        //  方式一: Reference Type 可被識別
        Console.WriteLine($"Dequeue GetType(): {shape.GetType()}");

        //  方式二: 利用本身的識別碼
        Console.WriteLine($"Dequeue Type: {shape.Type}");
    }
}
```

當傳入 Queue 的資料具有共同的 interface/abstruct 的情境，可以使用上面的寫法來處理。

但異質性資料使用的情況，相當高機率是用在不同類別資料，所以依然採用 `QueueItem` 的方式，來儲存異質性資料。

接著，在實作異質性資料，經由 `Dispatch` 分派到正確的 consumer，會遇到兩個問題。

* 當 Consumer 主動跟 `Dispatch` 請求資料，`Dispatch` 如何得知 Consumer 要取什麼類型的資料。
* 當 `Dispatch` 主動通知 Consumer 時，`Dispatch` 要如何 Consumer 接受何種類型的資料。

要特別注意，不管是那一種分派方式，當 Queue 存有異質性資料，而只有其中一種 consumer 來取得資料時，因為 FIFO 的特性，會發生 Queue 卡死的現象。

![Dispatch_3](/Dispatch_3.png)

#### 被動式分派

當 **consumer 主動跟 dispatch 請求資料**，Dispatch 依據 consumer 傳入的可接受的資料類型資訊，判斷 Queue 內第一筆的資料是否為回傳。若為可接受類型；直接回傳資料內容；反之，則回傳空值。

![Dispatch_4](/Dispatch_4.png)

這種分派方式，多數情境是應用於 consumer 未與 Dispatch 保持長連線狀態。例如取完資料後，就離線處理。直到作業完成後，才再次跟 Dispatch 請求資料。

Dispatch 在分派資料時，必須依賴 consumer 給與的資訊，才能正確的分派資料。所以，將 `IDispatch` 進行修改。

在異質性的 Queue 中，採用 `QueueItem` 的格式儲存資料，所以採用 `label`做為識別的資訊。

```C#
public interface IDispatch<T>
{
    void Binding(ConcurrentQueue<T> queue);

    void Register(IConsumer<T> consumer);

 // 加入請求資料類型的標簽
    T Push(string label);
}
```

因為 Queue 的資料格式定為 `QueueItem<byte[]>` ，實作如下。

```C#
 public class HeterogeneityDispatch : IDispatch<QueueItem<byte[]>>
 {
     private ConcurrentQueue<QueueItem<byte[]>> _bindingQueue;
     private List<IConsumer<QueueItem<byte[]>>> _consumers = new List<IConsumer<QueueItem<byte[]>>>();

     public void Binding(ConcurrentQueue<QueueItem<byte[]>> queue)
     {
         _bindingQueue = queue;
     }

     public void Register(IConsumer<QueueItem<byte[]>> consumer)
     {
         consumer.Binding(this);

         _consumers.Add(consumer);
     }

     QueueItem<byte[]> IDispatch<QueueItem<byte[]>>.Push(string label)
     {
         _bindingQueue.TryPeek(out var result);

         if (result.Label != label)
             return null;

         _bindingQueue.TryDequeue(out result);

         return result;
     }
 }

```

同時，我們將同質性實作的 `Consumer` 稍微調整。

```C#
public class Consumer<T> : IConsumer<T>
{
    protected IDispatch<T> _dispatch;
    public void Binding(IDispatch<T> dispatch)
    {
        _dispatch = dispatch;
    }
    public virtual void DoWork()
    {
    }
}
```

最後，針對兩種情境，進行簡易的單元測試

```C#
// 測試程式
[TestClass]
public class HeterogeneityDispatchTest
{
    private class IntConsumer : Consumer<QueueItem<byte[]>>
    {
        public List<int> Queue { get; } = new List<int>();

        public override void DoWork()
        {
            var entity = _dispatch.Push(typeof(int).ToString());

            if (entity == null)
                return;

            var data = BitConverter.ToInt32(entity.Payload);
            Queue.Add(data);
        }
    }

    private class StringConsumer : Consumer<QueueItem<byte[]>>
    {
        public List<string> Queue { get; } = new List<string>();

        public override void DoWork()
        {
            var entity = _dispatch.Push(typeof(string).ToString());

            if (entity == null)
                return;

            var data = Encoding.ASCII.GetString(entity.Payload);
            Queue.Add(data);
        }
    }

    [TestMethod]
    public void HeterogeneityDispatchTest_兩個consumer依順序取值()
    {
        var queue = GetQueue();

        var dispatch = new HeterogeneityDispatch();
        dispatch.Binding(queue);

        var consumer1 = new IntConsumer();
        dispatch.Register(consumer1);
        var consumer2 = new StringConsumer();
        dispatch.Register(consumer2);

        consumer1.DoWork();
        consumer2.DoWork();
        consumer1.DoWork();
        consumer2.DoWork();

        (new[] { 24, 36 }).ToExpectedObject().ShouldEqual(consumer1.Queue.ToArray());

        (new[] { "Flora MQ", "Message Queue" }).ToExpectedObject().ShouldEqual(consumer2.Queue.ToArray());
    }

    private static ConcurrentQueue<QueueItem<byte[]>> GetQueue()
    {
        var queue = new ConcurrentQueue<QueueItem<byte[]>>();
        queue.Enqueue(new QueueItem<byte[]>()
        {
            Label = typeof(int).ToString(),
            Payload = BitConverter.GetBytes(24)
        });

        queue.Enqueue(new QueueItem<byte[]>()
        {
            Label = typeof(string).ToString(),
            Payload = Encoding.ASCII.GetBytes("Flora MQ")
        });
        queue.Enqueue(new QueueItem<byte[]>()
        {
            Label = typeof(int).ToString(),
            Payload = BitConverter.GetBytes(36)
        });
        queue.Enqueue(new QueueItem<byte[]>()
        {
            Label = typeof(string).ToString(),
            Payload = Encoding.ASCII.GetBytes("Message Queue")
        });
        return queue;
    }

    [TestMethod]
    public void HeterogeneityDispatchTest_當只有一個consume取值時()
    {
        var queue = GetQueue();

        var dispatch = new HeterogeneityDispatch();
        dispatch.Binding(queue);

        var consumer1 = new IntConsumer();
        dispatch.Register(consumer1);
        var consumer2 = new StringConsumer();
        dispatch.Register(consumer2);

        consumer1.DoWork();
        consumer1.DoWork();
        consumer1.DoWork();
        consumer1.DoWork();

        (new[] { 24 }).ToExpectedObject().ShouldEqual(consumer1.Queue.ToArray());

        (new string[] { }).ToExpectedObject().ShouldEqual(consumer2.Queue.ToArray());
    }
}
```

#### 主動式分派

還有一種情況，是 consumer 會長時間與 Dispatch 保持連線，當 Queue 存在資料時，Dispatch 判斷資料的類型，主動通知相關的 consumer 。若假沒有對應的 consumer 可以處理資料，就進行額外的處理。

額外的處理方式很多種，完全取決於需求的方式。例如...

* 直接將無用的資料丟棄。放棄資料，確保 Queue 的通暢。
* 保持持續等待，直到對應的 consumer 連入。保留完整的資料，但可能導致 Queue 內的資料爆量。

在分派實作的部份，採用直接將無用的資料丟棄的作法。並使用`delegate`的方式，讓 Dispatch 可以主動通知 consumer 進行處理。當然，也可以使用 `Action<T>` 或 `Event` 進行實作，如果有更好的作法，也歡迎告知。

![Dispatch_5](/Dispatch_5.png)

```C#
   public class Consumer<T> : IConsumer<T>
    {
        // 略過原本程式碼

        public virtual string Key { get; }

  // 增加通知用的 method
        public virtual void Receive(T data)
        {
            throw new NotImplementedException();
        }
    }
    
    /// <summary>
    /// 異質性
    /// </summary>
    /// <seealso cref="EMQ.IDispatch{EMQ.QueueItem{System.Byte[]}}" />
    public class HeterogeneityDispatch : IDispatch<QueueItem<byte[]>>
    {
        private ConcurrentQueue<QueueItem<byte[]>> _bindingQueue;
        private readonly Dictionary<string, IConsumer<QueueItem<byte[]>>> _consumers = new Dictionary<string, IConsumer<QueueItem<byte[]>>>();

        public void Binding(ConcurrentQueue<QueueItem<byte[]>> queue)
        {
            _bindingQueue = queue;
        }

        public void Register(IConsumer<QueueItem<byte[]>> consumer)
        {
            consumer.Binding(this);

            _consumers[consumer.Key] = consumer;
        }

        QueueItem<byte[]> IDispatch<QueueItem<byte[]>>.Push(string label)
        {
            _bindingQueue.TryPeek(out var result);

            if (result.Label != label)
                return null;

            _bindingQueue.TryDequeue(out result);

            return result;
        }

        public void Notice()
        {
            while (true)
            {
                if (_bindingQueue.IsEmpty)
                {
                    SpinWait.SpinUntil(() => !_bindingQueue.IsEmpty, 10000);
                    continue;
                }

                _bindingQueue.TryDequeue(out var result);

                if (!_consumers.Keys.Contains(result.Label))
                {
                    continue;
                }

                _consumers[result.Label].Receive(result);
            }
        }
    }


```

```C#
// 測試程式
[TestClass]
public class HeterogeneityDispatchTest
{
    private class IntConsumer : Consumer<QueueItem<byte[]>>
    {
        public override string Key { get; } = typeof(int).ToString();

        public List<int> Queue { get; } = new List<int>();

        public override void DoWork()
        {
            var entity = _dispatch.Push(typeof(int).ToString());

            if (entity == null)
                return;

            var data = BitConverter.ToInt32(entity.Payload);
            Queue.Add(data);
        }

        public override void Receive(QueueItem<byte[]> entity)
        {
            var data = BitConverter.ToInt32(entity.Payload);
            Queue.Add(data);
        }
    }

    private class StringConsumer : Consumer<QueueItem<byte[]>>
    {
        public override string Key { get; } = typeof(string).ToString();
        public List<string> Queue { get; } = new List<string>();

        public override void DoWork()
        {
            var entity = _dispatch.Push(typeof(string).ToString());

            if (entity == null)
                return;

            var data = Encoding.ASCII.GetString(entity.Payload);
            Queue.Add(data);
        }

        public override void Receive(QueueItem<byte[]> entity)
        {
            var data = Encoding.ASCII.GetString(entity.Payload);
            Queue.Add(data);
        }
    }

    private static ConcurrentQueue<QueueItem<byte[]>> GetQueue()
    {
        var queue = new ConcurrentQueue<QueueItem<byte[]>>();
        queue.Enqueue(new QueueItem<byte[]>()
        {
            Label = typeof(int).ToString(),
            Payload = BitConverter.GetBytes(24)
        });

        queue.Enqueue(new QueueItem<byte[]>()
        {
            Label = typeof(string).ToString(),
            Payload = Encoding.ASCII.GetBytes("Flora MQ")
        });
        queue.Enqueue(new QueueItem<byte[]>()
        {
            Label = typeof(int).ToString(),
            Payload = BitConverter.GetBytes(36)
        });
        queue.Enqueue(new QueueItem<byte[]>()
        {
            Label = typeof(string).ToString(),
            Payload = Encoding.ASCII.GetBytes("Message Queue")
        });
        return queue;
    }

    [TestMethod]
    public void HeterogeneityDispatchTest_有2個consumer_主動通知()
    {
        var queue = GetQueue();

        var dispatch = new HeterogeneityDispatch();
        dispatch.Binding(queue);

        var consumer1 = new IntConsumer();
        dispatch.Register(consumer1);
        var consumer2 = new StringConsumer();
        dispatch.Register(consumer2);

        Task.Factory.StartNew(() => dispatch.Notice());

        Thread.Sleep(200);

        (new[] { 24, 36 }).ToExpectedObject().ShouldEqual(consumer1.Queue.ToArray());

        (new[] { "Flora MQ", "Message Queue" }).ToExpectedObject().ShouldEqual(consumer2.Queue.ToArray());
    }
}
```

在實作中，有許多地方是未處理或實作的。例如：

* 每種類型的 consumer 只能 `register` 一組 consumer。
* 在通知 consumer 處理資料，可以使用 `Async` 的機制。

這些部份，都是後面可以持續改進的部份。

### 5.4 優先性分派

又回到故事時間了，在談談優先性分派前，先來看個真實情境。

```
在急診室，醫生決定看診的順序，通常是取決於病患的病情急迫程度，而非先到先看。
因此，每位來到急診的患者，在經檢傷醫護人員的評估後，便會被判定一個檢傷分級，級數越嚴重的越優先看診。
```

這例子與 Priority Queue 的概念相同，但是因為高優先度的資料進入 Queue，就需要重整 Queue 的內容。這樣與 Queue FIFO 的特性有所違背。

我們將不同優先度的資料，視為不同 Queue 的資料。當資料進入時，會自動分配到對應的 Queue 中。而 consumer 向 Dispatch 分派資料，會優先將高優先度的 Queue 的資料分派出去。

![Dispatch_6_Priority](/Dispatch_6_Priority.png)

```c#
class PriorityDispatch<T>
{
    private Dictionary<int, ConcurrentQueue<T>> _queues = new Dictionary<int,ConcurrentQueue<T>>();

    public void Binding(int priority, ConcurrentQueue<T> queue)
    {
        _queues[priority] = queue;
    }

    public T Push()
    {
        // 取回排序後的優先度
        var prioritySet = _queues.Keys.OrderBy(x=>x);

        foreach (var priority in prioritySet)
        {
            if(_queues[priority].IsEmpty)
                continue;

            _queues[priority].TryDequeue(out var result);
            return result;
        }

        return default(T);
    }
}
```

```c#
[TestClass]
public class PriorityDispatchTest
{
    [TestMethod]
    public void PriorityDispatchTest_當2個queue_只有一個queue有資料()
    {
        var dispatch = new PriorityDispatch<int>();
        var highPriorityQueue = new ConcurrentQueue<int>();
        var lowPriorityQueue = new ConcurrentQueue<int>(new[] { 1, 2, 3 });

        dispatch.Binding(1, highPriorityQueue);
        dispatch.Binding(2, lowPriorityQueue);

        List<int> actual = new List<int>();

        actual.Add(dispatch.Push());
        actual.Add(dispatch.Push());
        actual.Add(dispatch.Push());

        (new[] { 1, 2, 3 }).ToExpectedObject().ShouldEqual(actual.ToArray());
    }

    [TestMethod]
    public void PriorityDispatchTest_當2個queue_只有均存在資料_輸出為高優先資料在前()
    {
        var dispatch = new PriorityDispatch<int>();
        var highPriorityQueue = new ConcurrentQueue<int>(new[] { 4, 5, 6 });
        var lowPriorityQueue = new ConcurrentQueue<int>(new[] { 1, 2, 3 });

        dispatch.Binding(1, highPriorityQueue);
        dispatch.Binding(2, lowPriorityQueue);

        List<int> actual = new List<int>();

        actual.Add(dispatch.Push());
        actual.Add(dispatch.Push());
        actual.Add(dispatch.Push());
        actual.Add(dispatch.Push());
        actual.Add(dispatch.Push());
        actual.Add(dispatch.Push());

        (new[] { 4,5,6,1, 2, 3 }).ToExpectedObject().ShouldEqual(actual.ToArray());
    }
}
```
