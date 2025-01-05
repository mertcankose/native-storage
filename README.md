# Native Storage Demo App

Bu proje, React Native ve Expo kullanılarak geliştirilmiş, TurboModules mimarisi ile native depolama özelliklerini gösteren bir demo uygulamasıdır. Native modüller ile AsyncStorage'a göre performans avantajı sağlanmaktadır.

## Özellikler

- TurboModules mimarisi ile geliştirilmiş native depolama modülleri:
  - Android için Kotlin implementasyonu
  - iOS için Objective-C implementasyonu
- Codegen ile otomatik kod üretimi
  - Spec dosyalarından native modül arayüzlerinin oluşturulması


## Başlangıç

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. Uygulamayı başlatın:

```bash
npx expo start
```

## Proje Yapısı

- `/specs` - Native modül tanımlamaları
- `/android` - Android native modül implementasyonu
  - Kotlin ile yazılmış storage modülü
  - TurboModules entegrasyonu
- `/ios` - iOS native modül implementasyonu
  - Objective-C ile yazılmış storage modülü
  - TurboModules entegrasyonu


## Native Modül Mimarisi

Bu proje, modern React Native native modül geliştirme yaklaşımını kullanmaktadır:

1. **Spec Tanımlaması**: Native modül arayüzleri spec dosyalarında tanımlanır
2. **Codegen**: React Native CLI ile spec dosyalarından native kod şablonları oluşturulur
3. **Native İmplementasyon**: 
   - Android: Kotlin ile NativeStorageModule implementasyonu
   - iOS: Objective-C ile RCTNativeStorageModule implementasyonu
4. **JavaScript Kullanımı**: TurboModules sayesinde type-safe native modül kullanımı


## Native Modül Kullanım Örneği

```typescript
import { NativeStorage } from './NativeStorage';

// Type-safe native modül kullanımı
await NativeStorage.setItem('key', 'value');
const value = await NativeStorage.getItem('key');
```

## Faydalı Kaynaklar

- [React Native TurboModules](https://reactnative.dev/docs/turbo-native-modules-introduction)


## Performans Karşılaştırması

Bu projedeki native storage implementasyonu, yaygın olarak kullanılan @react-native-async-storage/async-storage paketi ile karşılaştırılmıştır.

### Benchmark Sonuçları

![Performans Karşılaştırması](assets/images/compare.png)

*Grafik: Native Storage vs Async Storage performans karşılaştırması*

### Detaylı Analiz

- **Okuma İşlemleri**: Native Storage, Async Storage'a göre ortalama 2.5x daha hızlı
- **Yazma İşlemleri**: Native Storage, Async Storage'a göre ortalama 2.7x daha hızlı
- **Bellek Kullanımı**: Daha düşük memory footprint
- **Bridge Performansı**: TurboModules sayesinde daha hızlı native-js köprü iletişimi

