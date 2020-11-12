import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { combineLatest, interval, Observable, Subject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { FakeFlightService, Flight } from '@flight-workspace/flight-lib';

@Component({
    selector: 'flight-lookahead',
    templateUrl: './flight-lookahead.component.html'
})

export class FlightLookaheadComponent implements OnInit {

    constructor(private flightService: FakeFlightService) {
    }

    control: FormControl;
    flights$: Observable<Flight[]>;
    loading = false;

    online = false;   // Nicht die feine fränkische Art
    online$: Observable<boolean>;







    private refreshClickSubject = new Subject<void>();
    refreshClick$ = this.refreshClickSubject.asObservable();
    
    refresh() {
        this.refreshClickSubject.next();
    }


    ngOnInit() {
        this.control = new FormControl();

        this.online$ 
            = interval(2000).pipe( // 1, 2, 3, 4, 5
                    startWith(0), // 0, 1, 2, 3, 4, 5
                    map(_ => Math.random() < 0.5), // t, t, t, f, f
                    distinctUntilChanged(), // t, f
                    tap(value => this.online = value)
        );

        const input$ = this.control.valueChanges.pipe(
            debounceTime(300),
        )

        this.flights$ = combineLatest([input$, this.online$]).pipe(
            filter( ([_, online]) => online),
            map(([input, _]) => input),
            tap(v => this.loading = true),
            switchMap(name => this.load(name)),
            tap(v => this.loading = false),
        );




        // this.flights$ = this
        //                     .control
        //                     .valueChanges
        //                     .pipe(
        //                       debounceTime(300),
        //                       tap(v => this.loading = true),
        //                       switchMap(name => this.load(name)),
        //                       tap(v => this.loading = false)
        //                     );
    }

    load(from: string)  {
        // const url = "http://www.angular.at/api/flight";

        // const params = new HttpParams()
        //                     .set('from', from);

        // const headers = new HttpHeaders()
        //                     .set('Accept', 'application/json');

        // return this.http.get<Flight[]>(url, {params, headers});

        return this.flightService.find(from, '', false);
    };


}
