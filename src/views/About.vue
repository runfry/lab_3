<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-body text-center">
          <img src="@/assets/logo.png" alt="Логотип" class="img-fluid mb-4" style="max-width: 80px;">
          <h2>Про наш додаток</h2>
          <p class="lead">
            Цей додаток дозволяє користувачам публікувати пости, коментувати їх та взаємодіяти з іншими користувачами. Ми прагнемо створити зручну платформу для обміну думками та ідеями.
          </p>
          <hr>
          <div class="row mt-4">
            <div class="col-md-6">
              <h4><i class="bi bi-check-circle-fill text-success"></i> Основні функції</h4>
              <ul class="text-start">
                <li>Створення та публікація постів</li>
                <li>Коментування постів</li>
                <li>Реєстрація та авторизація користувачів</li>
                <li>Особистий профіль</li>
              </ul>
            </div>
            <div class="col-md-6">
              <h4><i class="bi bi-star-fill text-warning"></i> Переваги</h4>
              <ul class="text-start">
                <li>Зручний інтерфейс</li>
                <li>Адаптивний дизайн</li>
                <li>Швидка робота</li>
                <li>Безпека даних</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutView'
}
</script>

<style scoped>
/* Можна додати специфічні стилі для компонента */
</style>