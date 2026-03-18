import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardLayout from '@/views/DashboardLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import ScheduleAppointmentView from '@/views/ScheduleAppointmentView.vue'
import AccountView from '@/views/AccountView.vue'
import ManagementView from '@/views/ManagementView.vue'
import UsersView from '@/views/UsersView.vue'
import SlotsView from '@/views/SlotsView.vue'
import SpecialitiesView from '@/views/SpecialitiesView.vue'
import AppointmentsView from '@/views/AppointmentsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LoginView,
    },
    {
      path: '/login',
      component: LoginView,
    },
    {
      path: '/cadastro',
      component: RegisterView,
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      children: [
        {
          path: '',
          component: DashboardView,
        },
        {
          path: 'agendar',
          component: ScheduleAppointmentView,
        },
        {
          path: 'conta',
          component: AccountView,
        },
        {
          path: 'gerenciar',
          component: ManagementView,
        },
        {
          path: 'usuarios',
          component: UsersView,
        },
        {
          path: 'consultas',
          component: AppointmentsView,
        },
        {
          path: 'slots',
          component: SlotsView,
        },
        {
          path: 'especialidades',
          component: SpecialitiesView,
        },
      ],
    },
  ],
})

export default router
