import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, ChangeDetectorRef } from '@angular/core';
import { User } from '../models/user.model';
import {
  BehaviorSubject,
  tap,
  catchError,
  throwError,
  finalize,
  map,
} from 'rxjs';
import { LoadingService } from './loading.service';
import { SnackbarService } from './snackbar.service';
import { NavigationService } from './navigation.service';
import { AuthService } from './auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Teacher } from '../models/teacher.model';

interface SuperTeacher extends Teacher, User {}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiSuffix = 'api/v1/users';

  private users = new BehaviorSubject<User[]>([]);
  public users$ = this.users.asObservable();
  private teachers$ = new BehaviorSubject<SuperTeacher[]>([]);
  public teachers = this.teachers$.asObservable();

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
    private snackService: SnackbarService,
    private navigation: NavigationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  setUsers(users: User[]) {
    this.users.next(users);
  }

  getUsers(adminId: string) {
    const httpParams = new HttpParams({
      fromObject: {
        adminId,
      },
    });

    const finalUrl = this.apiSuffix;

    this.loadingService.load();

    return this.http
      .get<User[]>(finalUrl, {
        params: httpParams,
      })
      .pipe(
        catchError((err) => {
          console.error('Error: ', err);
          return throwError(err);
        }),
        tap((res: any) => {
          const users = res.data;
          if (res.success) {
            this.setUsers(users);
            console.log('Users retrieved succesfully !!!');
            this.loadingService.stop();
          }
        }),
        map((res) => {
          return res.data;
        }),
        finalize(() => {
          this.loadingService.stop();
        })
      );
  }

  getTeachers(adminId: string) {
    const httpParams = new HttpParams({
      fromObject: {
        adminId,
        type: 'TEACHER',
      },
    });

    const finalUrl = this.apiSuffix;

    this.loadingService.load();

    return this.http.get<any>(finalUrl, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error: ', err);
        return throwError(err);
      }),
      map((res) => {
        const teachers = res.data.map(
          ({ teacher, ...rest }: { teacher: any }) => {
            return {
              ...rest,
              TEACHER_ID: teacher.TEACHER_ID,
            };
          }
        );
        this.teachers$.next(teachers);
        return teachers;
      }),
      finalize(() => {
        this.loadingService.stop();
      })
    );
  }

  getUser(userId: string) {
    const finalUrl = this.apiSuffix + '/' + userId;

    this.loadingService.load();

    const getUser$ = this.http.get<any>(finalUrl);

    return getUser$.pipe(
      catchError((err) => {
        this.loadingService.stop();
        return throwError(err);
      }),
      map((res) => res.data),
      finalize(() => {
        this.loadingService.stop();
      })
    );
  }

  createUser(user: any, adminId: string) {
    user.role = user.role.toUpperCase();

    const httpParams = new HttpParams({
      fromObject: {
        adminId,
      },
    });
    const finalUrl = this.apiSuffix;

    this.loadingService.load();

    const createUser$ = this.http.post<any>(finalUrl, user, {
      params: httpParams,
    });

    return createUser$.pipe(
      catchError((err) => {
        this.loadingService.stop();
        return throwError(err);
      }),
      finalize(() => {
        this.snackService
          .openSnackBar(`The ${user.role} has been created successfully`, 'OK')
          .subscribe(() => {
            this.getUsers(adminId).subscribe(() => {
              this.navigation.navigateTo(['admin', 'users']);
            });
          });

        this.loadingService.stop();
      })
    );
  }

  deleteUser(user: any, adminId: string) {
    const httpParams = new HttpParams({
      fromObject: {
        adminId,
      },
    });
    const finalUrl = `${this.apiSuffix}/${user.USER_ID}`;

    this.loadingService.load();

    const deleteUser$ = this.http.delete<any>(finalUrl, {
      params: httpParams,
    });

    return deleteUser$.pipe(
      catchError((err) => {
        this.loadingService.stop();
        return throwError(err);
      }),
      finalize(() => {
        this.loadingService.stop();
        this.snackService
          .openSnackBar(
            `${user.USER_FNAME} ${user.USER_LNAME} has been deleted successfully.`,
            'OK'
          )
          .subscribe(() => {
            this.getUsers(adminId).subscribe(() => {
              this.navigation.navigateTo(['admin', 'users']);
            });
          });
      })
    );
  }

  goBackToMainRouter() {
    this.router.navigate([{ outlets: { other: null } }]);
  }

  editUser(user: any, adminId: string) {
    const httpParams = new HttpParams({
      fromObject: {
        adminId,
      },
    });
    const finalUrl = `${this.apiSuffix}/${user.USER_ID}`;

    this.loadingService.load();

    console.log(user);

    const editUser$ = this.http.put<any>(finalUrl, user, {
      params: httpParams,
    });

    return editUser$.pipe(
      catchError((err) => {
        this.loadingService.stop();
        return throwError(err);
      }),
      finalize(() => {
        this.loadingService.stop();
        this.snackService
          .openSnackBar(
            `${user.USER_FNAME} ${user.USER_LNAME} has been updated successfully.`,
            'OK'
          )
          .subscribe(() => {
            this.getUsers(adminId).subscribe(() => {
              window.history.back();
            });
          });
      })
    );
  }
}
