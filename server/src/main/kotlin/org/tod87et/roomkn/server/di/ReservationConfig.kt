package org.tod87et.roomkn.server.di

import io.ktor.server.application.ApplicationEnvironment
import io.ktor.server.config.ApplicationConfig
import org.koin.dsl.module
import kotlin.time.Duration
import kotlin.time.Duration.Companion.days
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.minutes

data class ReservationConfig(
    val maxPastOffset: Duration = DEFAULT_MAX_PAST_OFFSET,
    val maxFutureOffset: Duration = DEFAULT_MAX_FUTURE_OFFSET,
    val maxReservationDuration: Duration = DEFAULT_MAX_RESERVATION_DURATION,
) {
    companion object {
        private val DEFAULT_MAX_PAST_OFFSET: Duration = 12.hours
        private const val KEY_MAX_PAST_OFFSET: String = "reservationLimits.maxPastOffset"

        private val DEFAULT_MAX_FUTURE_OFFSET: Duration = 30.days
        private const val KEY_MAX_FUTURE_OFFSET: String = "reservationLimits.maxFutureOffset"

        private val DEFAULT_MAX_RESERVATION_DURATION: Duration = 1.days
        private const val KEY_MAX_RESERVATION_DURATION: String = "reservationLimits.maxReservationDuration"

        fun fromApplicationConfig(applicationConfig: ApplicationConfig) = ReservationConfig(
            maxPastOffset = applicationConfig.propertyOrNull(KEY_MAX_PAST_OFFSET)?.getString()
                ?.toIntOrNull()?.minutes ?: DEFAULT_MAX_PAST_OFFSET,
            maxFutureOffset = applicationConfig.propertyOrNull(KEY_MAX_FUTURE_OFFSET)?.getString()
                ?.toIntOrNull()?.minutes ?: DEFAULT_MAX_FUTURE_OFFSET,
            maxReservationDuration = applicationConfig.propertyOrNull(KEY_MAX_RESERVATION_DURATION)?.getString()
                ?.toIntOrNull()?.minutes ?: DEFAULT_MAX_RESERVATION_DURATION,
        )
    }
}

@Suppress("UnusedReceiverParameter")
val Di.reservationModule get() = module

private val module = module {
    single<ReservationConfig> { ReservationConfig.fromApplicationConfig(get<ApplicationEnvironment>().config) }
}
